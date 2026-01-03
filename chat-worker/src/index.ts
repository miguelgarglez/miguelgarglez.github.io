import { profileSections } from './profile-data';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type Env = {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_SITE_URL?: string;
  OPENROUTER_APP_TITLE?: string;
  DEV?: string;
};

const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
const OPENROUTER_TIMEOUT_MS = 25_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const prodOrigins = ['https://miguelgarglez.github.io'];
const localhostOrigins = ['http://localhost:4321/personal_site'];

const rateLimitStore = new Map<string, { count: number; reset: number }>();

const systemPromptBase =
  'You are a professional profile assistant for Miguel Garcia. ' +
  'Answer using only the provided context. ' +
  'If the answer is not in the context, say you do not have that information ' +
  'and invite the user to reach out by his X account or LinkedIn. ' +
  'Reply in the same language as the user.';

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
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  const requestedHeaders = requestHeaders?.get('Access-Control-Request-Headers');
  headers.set(
    'Access-Control-Allow-Headers',
    requestedHeaders?.trim() ||
      'Content-Type, Authorization, x-vercel-ai-ui-message-stream, User-Agent'
  );
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

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeText(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return [] as string[];
  return normalized.split(' ').filter((token) => token.length > 2);
}

const TAG_KEYWORDS: Record<string, string[]> = {
  trayectoria: [
    'trayectoria',
    'camino',
    'historia',
    'inicios',
    'origen',
    'empezar',
    'empece',
    'empezo',
  ],
  motivacion: ['motivacion', 'motiva', 'porque', 'razon', 'razones', 'pasion'],
  'forma-de-trabajar': [
    'trabajar',
    'forma',
    'metodo',
    'metodologia',
    'priorizo',
    'organizo',
    'proceso',
    'workflow',
  ],
  equipo: [
    'equipo',
    'companero',
    'colaboracion',
    'colaborar',
    'feedback',
    'comunicacion',
    'liderazgo',
  ],
  fortalezas: ['fortaleza', 'fortalezas', 'fuerte', 'strength'],
  debilidades: ['debilidad', 'debilidades', 'defecto', 'defectos'],
  valores: ['valores', 'principios', 'etica', 'importante', 'prioridad'],
  impacto: ['impacto', 'logro', 'resultado', 'metricas', 'mejora', 'mejorar'],
  aprendizaje: ['aprendizaje', 'aprender', 'aprendo', 'curiosidad'],
  cultura: ['cultura', 'ambiente', 'entorno'],
  proyectos: ['proyecto', 'proyectos', 'caso', 'ejemplo', 'situacion', 'reto'],
  futuro: ['futuro', 'objetivo', 'objetivos', 'crecer'],
};

const TYPE_KEYWORDS: Record<string, string[]> = {
  example: ['ejemplo', 'caso', 'situacion', 'reto', 'problema'],
  story: ['historia', 'camino', 'trayectoria', 'inicios', 'origen'],
  answer: ['fortaleza', 'debilidad', 'valoras', 'detestas', 'prefieres'],
};

const MAX_CONTEXT_BLOCKS = 6;

function extractIntentTags(tokens: string[]) {
  const intentTags = new Set<string>();
  Object.entries(TAG_KEYWORDS).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => tokens.includes(keyword))) {
      intentTags.add(tag);
    }
  });
  return intentTags;
}

function extractIntentTypes(tokens: string[]) {
  const intentTypes = new Set<string>();
  Object.entries(TYPE_KEYWORDS).forEach(([type, keywords]) => {
    if (keywords.some((keyword) => tokens.includes(keyword))) {
      intentTypes.add(type);
    }
  });
  return intentTypes;
}

function scoreSection(sectionText: string, tokens: string[]) {
  if (tokens.length === 0) return 0;
  const sectionTokens = new Set(tokenize(sectionText));
  let score = 0;
  tokens.forEach((token) => {
    if (sectionTokens.has(token)) score += 1;
  });
  return score;
}

function buildContext(question: string) {
  const tokens = tokenize(question);
  const intentTags = extractIntentTags(tokens);
  const intentTypes = extractIntentTypes(tokens);
  const ranked = profileSections
    .map((section) => ({
      section,
      score:
        scoreSection(`${section.title} ${section.content}`, tokens) +
        section.tags.reduce(
          (total, tag) => total + (intentTags.has(tag) ? 2 : 0),
          0
        ) +
        (intentTypes.has(section.type) ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  const topSections = ranked
    .filter((entry) => entry.score > 0)
    .slice(0, MAX_CONTEXT_BLOCKS)
    .map((entry) => `# ${entry.section.title}\n${entry.section.content}`);

  if (topSections.length === 0) {
    return profileSections
      .slice(0, MAX_CONTEXT_BLOCKS)
      .map((section) => `# ${section.title}\n${section.content}`)
      .join('\n\n');
  }

  return topSections.join('\n\n');
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
      ensureStarted();
    }
    ended = true;
    if (!controller) return;
    if (textStarted) {
      controller.enqueue(emitJson({ type: 'text-end', id: messageId }));
    }
    controller.enqueue(emitJson({ type: 'end', messageId }));
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
    controller.enqueue(emitJson({ type: 'error', message }));
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

    const originAllowed = origin ? (isDev || allowedOrigins.has(origin)) : isDev;
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
      return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
        status: 429,
        headers,
      });
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

    const context = buildContext(question);
    const systemPrompt = `${systemPromptBase}\n\nContext:\n${context}`;

    const payload = {
      model: env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(inboundMessages.length > 0
          ? inboundMessages
          : [{ role: 'user', content: question }]),
      ],
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer':
        env.OPENROUTER_SITE_URL ?? 'https://miguelgarglez.github.io',
      'X-Title': env.OPENROUTER_APP_TITLE ?? 'Miguel Garcia Profile Chat',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
    let upstream: Response;
    try {
      upstream = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );
    } catch (error) {
      const isTimeout =
        error instanceof Error && error.name === 'AbortError';
      const payload =
        env.DEV === 'true'
          ? {
              error: isTimeout ? 'OpenRouter timeout.' : 'OpenRouter request failed.',
              detail: error instanceof Error ? error.message : String(error),
            }
          : {
              error: isTimeout ? 'Upstream timeout.' : 'Upstream request failed.',
            };
      return new Response(JSON.stringify(payload), {
        status: isTimeout ? 504 : 502,
        headers: getJsonHeaders(origin, allowedOrigins, isDev),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text();
      const payload =
        env.DEV === 'true'
          ? { error: 'OpenRouter error.', detail }
          : { error: 'Upstream error.' };
      return new Response(JSON.stringify(payload), {
        status: 502,
        headers: getJsonHeaders(origin, allowedOrigins, isDev),
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
