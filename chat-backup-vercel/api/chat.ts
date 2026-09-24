import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyHeaders, buildCorsHeaders, getAllowedOrigins, isOriginAllowed } from '../src/cors.js';
import { buildSystemPrompt } from '../src/context.js';
import {
  computeBackoffMs,
  normalizeUpstreamFailure,
  parseRetryAfterMs,
  shouldRetryStatus,
  wait,
} from '../src/errors.js';
import { extractMessages, extractQuestion, parseRequestBody } from '../src/messages.js';
import { checkRateLimit, getClientIp, getRateLimitMax } from '../src/rate-limit.js';
import {
  captureOperationalIssue,
  flushTelemetry,
  logEvent,
  parseChatAttempt,
  parseFailoverReason,
  resolveRequestId,
  setTelemetryTag,
} from '../src/telemetry.js';
import { pipeOpenAiSseToUiMessageStream } from '../src/ui-stream.js';
import {
  buildUpstreamPayload,
  buildUpstreamUrl,
  resolveUpstreamApi,
  type ChatMessage,
} from '../src/upstream.js';

const UPSTREAM_TIMEOUT_MS = 25_000;
const UPSTREAM_MAX_ATTEMPTS = 3;
const UPSTREAM_RETRY_MAX_MS = 6_000;
const DEFAULT_LLM_BASE_URL = 'https://opencode.ai/zen/v1';
const DEFAULT_LLM_MODEL = 'gpt-5.4-nano';
const DEFAULT_LLM_PROVIDER = 'opencode';

function getHeaderValue(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(
  res: VercelResponse,
  status: number,
  payload: Record<string, unknown>,
  extraHeaders?: Record<string, string>
) {
  if (extraHeaders) {
    applyHeaders(res, extraHeaders);
  }
  res.status(status).json(payload);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startedAt = Date.now();
  const requestId = resolveRequestId(getHeaderValue(req.headers['x-chat-request-id']));
  const attempt = parseChatAttempt(getHeaderValue(req.headers['x-chat-attempt']));
  const failoverReason = parseFailoverReason(
    getHeaderValue(req.headers['x-chat-failover-reason'])
  );
  setTelemetryTag('chat.request_id', requestId);
  setTelemetryTag('chat.attempt', attempt);

  const allowedOrigins = getAllowedOrigins();
  const origin = getHeaderValue(req.headers.origin);
  const requestedHeaders = getHeaderValue(req.headers['access-control-request-headers']);
  const corsHeaders = buildCorsHeaders(origin, allowedOrigins, requestedHeaders);

  applyHeaders(res, corsHeaders);
  res.setHeader('X-Chat-Backend', 'vercel-fallback');
  res.setHeader('X-Chat-Request-Id', requestId);

  const logChatRequest = (
    outcome: string,
    status: number,
    extra: Record<string, unknown> = {},
    timingField: 'durationMs' | 'ttfbMs' = 'durationMs'
  ) =>
    logEvent('chat_request', {
      requestId,
      attempt,
      failoverReason,
      outcome,
      status,
      [timingField]: Date.now() - startedAt,
      ...extra,
    });

  if (attempt === 'secondary') {
    logEvent('failover_received', { requestId, failoverReason });
  }

  if (!isOriginAllowed(origin, allowedOrigins)) {
    return sendJson(res, 403, { error: 'Origin not allowed.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  const ip = getClientIp(req.headers);
  const now = Date.now();
  const rate = checkRateLimit(ip, now);
  if (rate.limited) {
    const retryAfterSeconds = Math.max(1, Math.ceil((rate.reset - now) / 1000));
    const headers = {
      'Retry-After': String(retryAfterSeconds),
      'X-RateLimit-Limit': String(getRateLimitMax()),
      'X-RateLimit-Remaining': String(rate.remaining),
      'X-RateLimit-Reset': String(rate.reset),
    };
    logChatRequest('rate_limited', 429, { retryAfterSeconds });
    await flushTelemetry();
    return sendJson(
      res,
      429,
      {
        error: 'Rate limit exceeded.',
        errorCode: 'WORKER_RATE_LIMIT',
        source: 'vercel-fallback',
        retryAfterSeconds,
      },
      headers
    );
  }

  const body = parseRequestBody(req.body);
  if (!body) {
    logChatRequest('bad_request', 400, { reason: 'invalid_json' });
    return sendJson(res, 400, { error: 'Invalid JSON body.' });
  }

  const inboundMessages = extractMessages(body);
  const question = extractQuestion({ messages: inboundMessages }) || extractQuestion(body);
  if (!question) {
    logChatRequest('bad_request', 400, { reason: 'missing_question' });
    return sendJson(res, 400, { error: 'Missing question.' });
  }

  const apiToken = process.env.LLM_API_KEY?.trim();
  const llmProvider = (process.env.LLM_PROVIDER ?? DEFAULT_LLM_PROVIDER).trim();
  const llmModel = (process.env.LLM_MODEL ?? DEFAULT_LLM_MODEL).trim();
  const llmBaseUrl = (process.env.LLM_BASE_URL ?? DEFAULT_LLM_BASE_URL)
    .trim()
    .replace(/\/+$/, '');
  if (!apiToken) {
    logChatRequest('config_missing', 500, { errorCode: 'LLM_CONFIG_MISSING' });
    captureOperationalIssue(
      'LLM config missing',
      { attempt, errorCode: 'LLM_CONFIG_MISSING' },
      { requestId, failoverReason }
    );
    await flushTelemetry();
    return sendJson(res, 500, {
      error: 'Missing LLM_API_KEY.',
      errorCode: 'LLM_CONFIG_MISSING',
      source: 'llm',
    });
  }

  const upstreamApi = resolveUpstreamApi(llmModel);
  const payload = buildUpstreamPayload(
    llmModel,
    [
      { role: 'system', content: buildSystemPrompt(question) },
      ...(inboundMessages.length > 0
        ? inboundMessages
        : [{ role: 'user', content: question }]),
    ] as ChatMessage[],
    true
  );
  const upstreamUrl = buildUpstreamUrl(llmBaseUrl, llmModel);
  const upstreamHeaders = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.LLM_SITE_URL ?? 'https://miguelgarglez.com',
    'X-Title': process.env.LLM_APP_TITLE ?? 'Miguel Garcia Profile Chat',
  };

  let upstream: Response | null = null;
  let upstreamStatus = 0;
  let upstreamDetail = '';
  let upstreamRetryAfterMs: number | null = null;
  let requestError: string | null = null;
  let requestTimedOut = false;
  let attempts = 0;

  for (let attempt = 1; attempt <= UPSTREAM_MAX_ATTEMPTS; attempt += 1) {
    attempts = attempt;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers: upstreamHeaders,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      requestTimedOut = error instanceof Error && error.name === 'AbortError';
      requestError = error instanceof Error ? error.message : String(error);
      if (attempt < UPSTREAM_MAX_ATTEMPTS) {
        await wait(computeBackoffMs(attempt, null));
        continue;
      }
      break;
    } finally {
      clearTimeout(timeoutId);
    }

    if (upstream.ok && upstream.body) {
      break;
    }

    upstreamStatus = upstream.status;
    upstreamDetail = await upstream.text();
    upstreamRetryAfterMs = parseRetryAfterMs(upstream.headers.get('Retry-After'));

    const canRetryRateLimit =
      upstream.status !== 429 ||
      (attempt === 1 &&
        (upstreamRetryAfterMs === null || upstreamRetryAfterMs <= UPSTREAM_RETRY_MAX_MS));

    const shouldRetry =
      attempt < UPSTREAM_MAX_ATTEMPTS && shouldRetryStatus(upstream.status) && canRetryRateLimit;

    if (shouldRetry) {
      await wait(computeBackoffMs(attempt, upstreamRetryAfterMs));
      continue;
    }

    break;
  }

  const includeDebug = process.env.NODE_ENV !== 'production';

  if (!upstream) {
    const unreachableErrorCode = requestTimedOut
      ? 'UPSTREAM_TIMEOUT'
      : 'UPSTREAM_REQUEST_FAILED';
    logChatRequest('upstream_unreachable', requestTimedOut ? 504 : 502, {
      errorCode: unreachableErrorCode,
      attempts,
      provider: llmProvider,
      api: upstreamApi,
    });
    captureOperationalIssue(
      'Upstream unreachable',
      { provider: llmProvider, api: upstreamApi, errorCode: unreachableErrorCode, upstreamStatus: 'none', attempt },
      { requestId, attempts, failoverReason }
    );
    await flushTelemetry();
    const payload = includeDebug
      ? {
          error: requestTimedOut ? 'Upstream timeout.' : 'Upstream request failed.',
          errorCode: unreachableErrorCode,
          source: 'llm',
          detail: requestError,
          attempts,
        }
      : {
          error: requestTimedOut ? 'Upstream timeout.' : 'Upstream request failed.',
          errorCode: unreachableErrorCode,
          source: 'llm',
        };

    return sendJson(res, requestTimedOut ? 504 : 502, payload);
  }

  if (!upstream.ok || !upstream.body) {
    const normalized = normalizeUpstreamFailure(
      upstreamStatus,
      upstreamDetail,
      upstreamRetryAfterMs,
      includeDebug,
      attempts
    );

    const errorCode =
      typeof normalized.payload.errorCode === 'string'
        ? normalized.payload.errorCode
        : 'UPSTREAM_ERROR';

    logEvent('upstream_error', {
      requestId,
      attempt,
      failoverReason,
      provider: llmProvider,
      api: upstreamApi,
      upstreamStatus,
      attempts,
      retryAfterMs: upstreamRetryAfterMs,
      errorCode,
    });

    logChatRequest('upstream_error', normalized.status, {
      upstreamStatus,
      errorCode,
      attempts,
      provider: llmProvider,
      api: upstreamApi,
    });

    if (normalized.status !== 429) {
      captureOperationalIssue(
        'Upstream error',
        {
          provider: llmProvider,
          api: upstreamApi,
          errorCode,
          upstreamStatus: String(upstreamStatus),
          attempt,
        },
        { requestId, attempts, failoverReason }
      );
    }
    await flushTelemetry();

    const headers: Record<string, string> = {};
    if (normalized.status === 429 && upstreamRetryAfterMs !== null) {
      headers['Retry-After'] = String(Math.max(1, Math.ceil(upstreamRetryAfterMs / 1000)));
    }

    return sendJson(res, normalized.status, normalized.payload, headers);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('x-vercel-ai-ui-message-stream', 'v1');

  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  logChatRequest(
    'ok',
    200,
    {
      provider: llmProvider,
      model: llmModel,
      api: upstreamApi,
      attempts,
    },
    'ttfbMs'
  );

  await pipeOpenAiSseToUiMessageStream(upstream.body, res, (info) => {
    logEvent('chat_stream_end', {
      requestId,
      receivedBytes: info.receivedBytes,
      errorSent: info.errorSent,
      durationMs: Date.now() - startedAt,
    });
  });

  await flushTelemetry();
}
