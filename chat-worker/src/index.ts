import { buildSystemPrompt } from '../../chat-backup-vercel/shared/chat-context/context';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type Env = {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_FALLBACK_MODELS?: string;
  OPENROUTER_SITE_URL?: string;
  OPENROUTER_APP_TITLE?: string;
  DEV?: string;
};

const DEFAULT_MODEL = 'openrouter/free';
const DEFAULT_FALLBACK_MODELS = [
  'stepfun/step-3.5-flash:free',
  'arcee-ai/trinity-large-preview:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
];
const OPENROUTER_TIMEOUT_MS = 25_000;
const OPENROUTER_MAX_ATTEMPTS = 3;
const OPENROUTER_RETRY_BASE_MS = 500;
const OPENROUTER_RETRY_MAX_MS = 6_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const RETRYABLE_UPSTREAM_STATUS = new Set([408, 429, 500, 502, 503, 504]);

const prodOrigins = ['https://miguelgarglez.github.io'];
const localhostOrigins = ['http://localhost:4321/personal_site'];

const rateLimitStore = new Map<string, { count: number; reset: number }>();

function getAllowedOrigins(env: Env) {
  const origins = [...prodOrigins];
  if (env.DEV === 'true') {
    origins.push(...localhostOrigins);
  }
  return new Set(origins);
}

function getClientIp(request: Request) {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return cfIp;
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return 'unknown';
}

function checkRateLimit(ip: string, now: number) {
  const existing = rateLimitStore.get(ip);
  if (!existing || now > existing.reset) {
    const next = { count: 1, reset: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(ip, next);
    return { limited: false, remaining: RATE_LIMIT_MAX - 1, reset: next.reset };
  }

  existing.count += 1;
  rateLimitStore.set(ip, existing);

  return {
    limited: existing.count > RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - existing.count),
    reset: existing.reset,
  };
}

function getCorsHeaders(
  origin: string | null,
  allowedOrigins: Set<string>,
  isDev: boolean,
  requestHeaders?: Headers
) {
  const headers = new Headers();
  if (origin && (isDev || allowedOrigins.has(origin))) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  const requestedHeaders = requestHeaders?.get('Access-Control-Request-Headers');
  headers.set(
    'Access-Control-Allow-Headers',
    requestedHeaders?.trim() ||
      'Content-Type, Authorization, x-vercel-ai-ui-message-stream, User-Agent'
  );
  headers.set('X-Chat-Backend', 'cloudflare');
  return headers;
}

function getJsonHeaders(
  origin: string | null,
  allowedOrigins: Set<string>,
  isDev: boolean,
  requestHeaders?: Headers
) {
  const headers = getCorsHeaders(origin, allowedOrigins, isDev, requestHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return headers;
}

function extractQuestion(body: Record<string, unknown>) {
  if (typeof body.question === 'string') return body.question.trim();
  if (Array.isArray(body.messages)) {
    const lastUser = [...body.messages]
      .reverse()
      .find(
        (message) =>
          typeof message === 'object' &&
          message &&
          (message as ChatMessage).role === 'user' &&
          typeof (message as ChatMessage).content === 'string'
      ) as ChatMessage | undefined;

    if (lastUser?.content) return lastUser.content.trim();
  }

  return '';
}

function coerceContent(message: Record<string, unknown>) {
  if (typeof message.content === 'string') return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        if ((part as { type?: string }).type === 'text') {
          const text = (part as { text?: string }).text;
          return typeof text === 'string' ? text : '';
        }
        return '';
      })
      .join('');
  }
  return '';
}

function extractMessages(body: Record<string, unknown>) {
  if (!Array.isArray(body.messages)) return [] as ChatMessage[];
  return body.messages
    .filter((message) => message && typeof message === 'object')
    .map((message) => {
      const record = message as Record<string, unknown>;
      const role = record.role;
      const content = coerceContent(record).trim();
      if (
        (role === 'user' || role === 'assistant' || role === 'system') &&
        typeof content === 'string' &&
        content.length > 0
      ) {
        return { role, content };
      }
      return null;
    })
    .filter((message): message is ChatMessage => Boolean(message));
}

function parseModelList(raw: string | undefined) {
  if (!raw) return [] as string[];
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(value: string | null) {
  if (!value) return null;
  const seconds = Number(value);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }
  const dateMs = Date.parse(value);
  if (Number.isNaN(dateMs)) return null;
  return Math.max(0, dateMs - Date.now());
}

function computeBackoffMs(attempt: number, retryAfterMs: number | null) {
  if (retryAfterMs !== null) {
    return Math.min(retryAfterMs, OPENROUTER_RETRY_MAX_MS);
  }
  const base = OPENROUTER_RETRY_BASE_MS * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(base + jitter, OPENROUTER_RETRY_MAX_MS);
}

function extractUpstreamError(detail: string) {
  try {
    const parsed = JSON.parse(detail) as Record<string, unknown>;
    const error = parsed.error as Record<string, unknown> | undefined;
    const message = error?.message;
    const code = error?.code;
    if (typeof message === 'string' && typeof code === 'number') {
      return { message, code };
    }
    if (typeof message === 'string') {
      return { message };
    }
  } catch {
    return null;
  }
  return null;
}

function createUiMessageStream(upstream: ReadableStream<Uint8Array>) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const messageId = `msg_${crypto.randomUUID()}`;
  let buffer = '';
  let started = false;
  let textStarted = false;
  let ended = false;
  let doneSent = false;
  let errorSent = false;
  let stopReading = false;
  let receivedBytes = 0;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  const emit = (payload: string) => encoder.encode(`data: ${payload}\n\n`);

  const emitJson = (payload: Record<string, unknown>) =>
    emit(JSON.stringify(payload));

  const ensureStarted = () => {
    if (started) return;
    started = true;
    textStarted = true;
    if (!controller) return;
    controller.enqueue(emitJson({ type: 'start', messageId }));
    controller.enqueue(emitJson({ type: 'text-start', id: messageId }));
  };

  const endMessage = () => {
    if (ended) return;
    if (!started) {
      ended = true;
      return;
    }
    ended = true;
    if (!controller) return;
    if (textStarted) {
      controller.enqueue(emitJson({ type: 'text-end', id: messageId }));
    }
    controller.enqueue(emitJson({ type: 'finish', finishReason: 'stop' }));
  };

  const sendDone = () => {
    if (doneSent) return;
    if (!controller) return;
    controller.enqueue(emit('[DONE]'));
    doneSent = true;
  };

  const sendError = (message: string) => {
    if (errorSent) return;
    errorSent = true;
    if (!controller) return;
    controller.enqueue(emitJson({ type: 'error', errorText: message }));
  };

  const handleData = (data: string) => {
    if (!data) return;
    if (data === '[DONE]') {
      endMessage();
      sendDone();
      stopReading = true;
      reader?.cancel().catch(() => undefined);
      return;
    }

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(data) as Record<string, unknown>;
    } catch {
      return;
    }

    const choice = Array.isArray(parsed.choices)
      ? (parsed.choices[0] as Record<string, unknown> | undefined)
      : undefined;
    const delta = choice?.delta as Record<string, unknown> | undefined;
    const content = delta?.content;
    if (typeof content === 'string' && content.length > 0) {
      ensureStarted();
      if (controller) {
        controller.enqueue(
          emitJson({ type: 'text-delta', id: messageId, delta: content })
        );
      }
    }

    const finishReason = choice?.finish_reason;
    if (typeof finishReason === 'string' && finishReason.length > 0) {
      endMessage();
    }
  };

  const processBuffer = () => {
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach((rawLine) => {
      const line = rawLine.trimEnd();
      if (!line || line.startsWith(':')) return;
      if (!line.startsWith('data:')) return;
      const data = line.slice(5).trimStart();
      handleData(data);
    });
  };

  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

  return new ReadableStream<Uint8Array>({
    async start(streamController) {
      controller = streamController;
      reader = upstream.getReader();

      try {
        while (reader) {
          const { value, done } = await reader.read();
          if (done) break;
          if (stopReading) break;
          if (value) {
            receivedBytes += value.length;
          }
          buffer += decoder.decode(value, { stream: true });
          processBuffer();
        }
        buffer += decoder.decode();
        processBuffer();
      } catch (error) {
        if (!ended) {
          sendError(
            error instanceof Error ? error.message : 'Stream processing error.'
          );
        }
      } finally {
        if (receivedBytes === 0 && !errorSent) {
          sendError('No response from the model.');
        }
        endMessage();
        sendDone();
        controller.close();
      }
    },
    cancel() {
      if (reader) {
        reader.cancel().catch(() => undefined);
      }
    },
  });
}

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigins = getAllowedOrigins(env);
    const isDev = env.DEV === 'true';
    const corsHeaders = getCorsHeaders(origin, allowedOrigins, isDev, request.headers);

    const isHealthRequest =
      request.method === 'GET' && (pathname === '/' || pathname === '/healthz');
    const originAllowed = origin
      ? isDev || allowedOrigins.has(origin)
      : isDev || isHealthRequest;
    if (!originAllowed) {
      return new Response(JSON.stringify({ error: 'Origin not allowed.' }), {
        status: 403,
        headers: getJsonHeaders(origin, allowedOrigins, isDev, request.headers),
      });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'GET' && pathname === '/') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (request.method === 'GET' && pathname === '/healthz') {
      return new Response(
        JSON.stringify({ ok: true, backend: 'cloudflare' }),
        {
          status: 200,
          headers: getJsonHeaders(origin, allowedOrigins, isDev, request.headers),
        }
      );
    }

    if (request.method !== 'POST' || pathname !== '/chat') {
      return new Response('Not found', {
        status: 404,
        headers: corsHeaders,
      });
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(ip, Date.now());
    if (rate.limited) {
      const headers = getJsonHeaders(origin, allowedOrigins, isDev, request.headers);
      headers.set(
        'Retry-After',
        String(Math.ceil((rate.reset - Date.now()) / 1000))
      );
      headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
      headers.set('X-RateLimit-Remaining', String(rate.remaining));
      headers.set('X-RateLimit-Reset', String(rate.reset));
      const retryAfterSeconds = Math.ceil((rate.reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded.',
          errorCode: 'WORKER_RATE_LIMIT',
          source: 'worker',
          retryAfterSeconds,
        }),
        {
          status: 429,
          headers,
        }
      );
    }

    if (!env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing OPENROUTER_API_KEY.' }),
        {
          status: 500,
          headers: getJsonHeaders(origin, allowedOrigins, isDev, request.headers),
        }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
        status: 400,
        headers: getJsonHeaders(origin, allowedOrigins, isDev, request.headers),
      });
    }

    const inboundMessages = extractMessages(body);
    const question =
      extractQuestion({ messages: inboundMessages }) || extractQuestion(body);
    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question.' }), {
        status: 400,
        headers: getJsonHeaders(origin, allowedOrigins, isDev, request.headers),
      });
    }

    const systemPrompt = buildSystemPrompt(question);

    const primaryModel = (env.OPENROUTER_MODEL ?? DEFAULT_MODEL).trim();
    const configuredFallbacks = parseModelList(env.OPENROUTER_FALLBACK_MODELS);
    const fallbackModels = (
      configuredFallbacks.length > 0
        ? configuredFallbacks
        : DEFAULT_FALLBACK_MODELS
    ).filter((model) => model !== primaryModel);

    const payload: Record<string, unknown> = {
      model: primaryModel,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(inboundMessages.length > 0
          ? inboundMessages
          : [{ role: 'user', content: question }]),
      ],
      provider: {
        allow_fallbacks: true,
        sort: 'throughput',
      },
    };
    if (fallbackModels.length > 0) {
      payload.models = fallbackModels;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer':
        env.OPENROUTER_SITE_URL ?? 'https://miguelgarglez.github.io',
      'X-Title': env.OPENROUTER_APP_TITLE ?? 'Miguel Garcia Profile Chat',
    };

    let upstream: Response | null = null;
    let upstreamStatus = 0;
    let upstreamDetail = '';
    let upstreamRetryAfterMs: number | null = null;
    let requestError: string | null = null;
    let requestTimedOut = false;
    let attempts = 0;

    for (let attempt = 1; attempt <= OPENROUTER_MAX_ATTEMPTS; attempt += 1) {
      attempts = attempt;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

      try {
        upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch (error) {
        clearTimeout(timeoutId);
        requestTimedOut = error instanceof Error && error.name === 'AbortError';
        requestError = error instanceof Error ? error.message : String(error);
        if (attempt < OPENROUTER_MAX_ATTEMPTS) {
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
      const retryAfterMs = parseRetryAfterMs(upstream.headers.get('Retry-After'));
      upstreamRetryAfterMs = retryAfterMs;
      const canRetryRateLimit =
        upstream.status !== 429 ||
        (attempt === 1 &&
          (retryAfterMs === null || retryAfterMs <= OPENROUTER_RETRY_MAX_MS));
      const shouldRetry =
        attempt < OPENROUTER_MAX_ATTEMPTS &&
        RETRYABLE_UPSTREAM_STATUS.has(upstream.status) &&
        canRetryRateLimit;
      if (shouldRetry) {
        await wait(computeBackoffMs(attempt, retryAfterMs));
        continue;
      }
      break;
    }

    if (!upstream) {
      const payload =
        env.DEV === 'true'
          ? {
              error: requestTimedOut
                ? 'OpenRouter timeout.'
                : 'OpenRouter request failed.',
              errorCode: requestTimedOut
                ? 'OPENROUTER_TIMEOUT'
                : 'OPENROUTER_REQUEST_FAILED',
              source: 'openrouter',
              detail: requestError,
              attempts,
            }
          : {
              error: requestTimedOut
                ? 'Upstream timeout.'
                : 'Upstream request failed.',
              errorCode: requestTimedOut
                ? 'OPENROUTER_TIMEOUT'
                : 'OPENROUTER_REQUEST_FAILED',
              source: 'openrouter',
            };
      return new Response(JSON.stringify(payload), {
        status: requestTimedOut ? 504 : 502,
        headers: getJsonHeaders(origin, allowedOrigins, isDev),
      });
    }

    if (!upstream.ok || !upstream.body) {
      const parsed = extractUpstreamError(upstreamDetail);
      let status = 502;
      let error = 'Upstream error.';
      let errorCode = 'OPENROUTER_UPSTREAM_ERROR';
      if (upstreamStatus === 429) {
        status = 429;
        error = 'Upstream rate limit exceeded.';
        errorCode = 'OPENROUTER_RATE_LIMIT';
      } else if (upstreamStatus === 402) {
        status = 503;
        error = 'Upstream quota exceeded.';
        errorCode = 'OPENROUTER_QUOTA_EXCEEDED';
      }

      const responseHeaders = getJsonHeaders(origin, allowedOrigins, isDev);
      if (status === 429 && upstreamRetryAfterMs !== null) {
        responseHeaders.set(
          'Retry-After',
          String(Math.max(1, Math.ceil(upstreamRetryAfterMs / 1000)))
        );
      }

      const payload =
        env.DEV === 'true'
          ? {
              error,
              errorCode,
              source: 'openrouter',
              upstreamStatus,
              detail: parsed?.message ?? upstreamDetail,
              upstreamCode: parsed?.code,
              attempts,
              retryAfterSeconds:
                upstreamRetryAfterMs !== null
                  ? Math.max(1, Math.ceil(upstreamRetryAfterMs / 1000))
                  : null,
            }
          : {
              error,
              errorCode,
              source: 'openrouter',
              retryAfterSeconds:
                upstreamRetryAfterMs !== null
                  ? Math.max(1, Math.ceil(upstreamRetryAfterMs / 1000))
                  : null,
            };

      return new Response(JSON.stringify(payload), {
        status,
        headers: responseHeaders,
      });
    }

    const streamHeaders = new Headers(corsHeaders);
    streamHeaders.set('Content-Type', 'text/event-stream; charset=utf-8');
    streamHeaders.set('Cache-Control', 'no-cache, no-transform');
    streamHeaders.set('Connection', 'keep-alive');
    streamHeaders.set('x-vercel-ai-ui-message-stream', 'v1');

    const requestStreamHeader = request.headers.get(
      'x-vercel-ai-ui-message-stream'
    );
    if (requestStreamHeader === 'v1') {
      streamHeaders.set('x-vercel-ai-ui-message-stream', 'v1');
    }

    const uiStream = createUiMessageStream(upstream.body);

    return new Response(uiStream, {
      status: 200,
      headers: streamHeaders,
    });
  },
};
