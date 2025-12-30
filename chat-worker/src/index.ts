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
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const prodOrigins = ['https://miguelgarglez.github.io'];
const localhostOrigins = [
  'http://localhost:4321',
  'http://localhost:3000',
  'http://localhost:5173',
];

const rateLimitStore = new Map<string, { count: number; reset: number }>();

const systemPromptBase =
  'You are a professional profile assistant for Miguel Garcia. ' +
  'Answer using only the provided context. ' +
  'If the answer is not in the context, say you do not have that information ' +
  'and invite the user to reach out by email or LinkedIn. ' +
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

function getCorsHeaders(origin: string | null, allowedOrigins: Set<string>) {
  const headers = new Headers();
  if (origin && allowedOrigins.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return headers;
}

function getJsonHeaders(origin: string | null, allowedOrigins: Set<string>) {
  const headers = getCorsHeaders(origin, allowedOrigins);
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
  const ranked = profileSections
    .map((section) => ({
      section,
      score: scoreSection(section.content, tokens),
    }))
    .sort((a, b) => b.score - a.score);

  const topSections = ranked
    .filter((entry) => entry.score > 0)
    .slice(0, 4)
    .map((entry) => `# ${entry.section.title}\n${entry.section.content}`);

  if (topSections.length === 0) {
    return profileSections
      .slice(0, 4)
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

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigins = getAllowedOrigins(env);
    const corsHeaders = getCorsHeaders(origin, allowedOrigins);

    if ((!origin && env.DEV !== 'true') || (origin && !allowedOrigins.has(origin))) {
      return new Response(JSON.stringify({ error: 'Origin not allowed.' }), {
        status: 403,
        headers: getJsonHeaders(origin, allowedOrigins),
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
      const headers = getJsonHeaders(origin, allowedOrigins);
      headers.set('Retry-After', String(Math.ceil((rate.reset - Date.now()) / 1000)));
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
        { status: 500, headers: getJsonHeaders(origin, allowedOrigins) }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
        status: 400,
        headers: getJsonHeaders(origin, allowedOrigins),
      });
    }

    const question = extractQuestion(body);
    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question.' }), {
        status: 400,
        headers: getJsonHeaders(origin, allowedOrigins),
      });
    }

    const context = buildContext(question);
    const systemPrompt = `${systemPromptBase}\n\nContext:\n${context}`;

    const payload = {
      model: env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer':
        env.OPENROUTER_SITE_URL ?? 'https://miguelgarglez.github.io',
      'X-Title': env.OPENROUTER_APP_TITLE ?? 'Miguel Garcia Profile Chat',
    };

    const upstream = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text();
      const payload = env.DEV === 'true'
        ? { error: 'OpenRouter error.', detail }
        : { error: 'Upstream error.' };
      return new Response(JSON.stringify(payload), {
        status: 502,
        headers: getJsonHeaders(origin, allowedOrigins),
      });
    }

    const streamHeaders = new Headers(corsHeaders);
    streamHeaders.set('Content-Type', 'text/event-stream; charset=utf-8');
    streamHeaders.set('Cache-Control', 'no-cache, no-transform');
    streamHeaders.set('Connection', 'keep-alive');

    return new Response(upstream.body, {
      status: 200,
      headers: streamHeaders,
    });
  },
};
