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
import { pipeOpenAiSseToUiMessageStream } from '../src/ui-stream.js';

const WORKERS_AI_TIMEOUT_MS = 25_000;
const WORKERS_AI_MAX_ATTEMPTS = 3;
const WORKERS_AI_RETRY_MAX_MS = 6_000;
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

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
  const allowedOrigins = getAllowedOrigins();
  const origin = getHeaderValue(req.headers.origin);
  const requestedHeaders = getHeaderValue(req.headers['access-control-request-headers']);
  const corsHeaders = buildCorsHeaders(origin, allowedOrigins, requestedHeaders);

  applyHeaders(res, corsHeaders);
  res.setHeader('X-Chat-Backend', 'vercel-fallback');

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
    return sendJson(res, 400, { error: 'Invalid JSON body.' });
  }

  const inboundMessages = extractMessages(body);
  const question = extractQuestion({ messages: inboundMessages }) || extractQuestion(body);
  if (!question) {
    return sendJson(res, 400, { error: 'Missing question.' });
  }

  const apiToken = process.env.CF_API_TOKEN?.trim();
  const accountId = process.env.CF_ACCOUNT_ID?.trim();
  const model = process.env.WORKERS_AI_MODEL?.trim() || DEFAULT_MODEL;
  if (!apiToken || !accountId) {
    return sendJson(res, 500, {
      error: 'Missing Workers AI credentials.',
      errorCode: 'UPSTREAM_REQUEST_FAILED',
      source: 'workers-ai',
    });
  }

  const payload: Record<string, unknown> = {
    model,
    stream: true,
    messages: [
      { role: 'system', content: buildSystemPrompt(question) },
      ...(inboundMessages.length > 0 ? inboundMessages : [{ role: 'user', content: question }]),
    ],
  };

  const upstreamUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`;
  const upstreamHeaders = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  let upstream: Response | null = null;
  let upstreamStatus = 0;
  let upstreamDetail = '';
  let upstreamRetryAfterMs: number | null = null;
  let requestError: string | null = null;
  let requestTimedOut = false;
  let attempts = 0;

  for (let attempt = 1; attempt <= WORKERS_AI_MAX_ATTEMPTS; attempt += 1) {
    attempts = attempt;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WORKERS_AI_TIMEOUT_MS);

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
      if (attempt < WORKERS_AI_MAX_ATTEMPTS) {
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
        (upstreamRetryAfterMs === null || upstreamRetryAfterMs <= WORKERS_AI_RETRY_MAX_MS));

    const shouldRetry =
      attempt < WORKERS_AI_MAX_ATTEMPTS && shouldRetryStatus(upstream.status) && canRetryRateLimit;

    if (shouldRetry) {
      await wait(computeBackoffMs(attempt, upstreamRetryAfterMs));
      continue;
    }

    break;
  }

  const includeDebug = process.env.NODE_ENV !== 'production';

  if (!upstream) {
    const payload = includeDebug
      ? {
          error: requestTimedOut ? 'Workers AI timeout.' : 'Workers AI request failed.',
          errorCode: requestTimedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_REQUEST_FAILED',
          source: 'workers-ai',
          detail: requestError,
          attempts,
        }
      : {
          error: requestTimedOut ? 'Upstream timeout.' : 'Upstream request failed.',
          errorCode: requestTimedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_REQUEST_FAILED',
          source: 'workers-ai',
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

  await pipeOpenAiSseToUiMessageStream(upstream.body, res);
}
