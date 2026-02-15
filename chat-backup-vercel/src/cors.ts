const DEFAULT_ALLOWED_ORIGINS = [
  'https://miguelgarglez.github.io',
  'http://localhost:4321',
  'http://localhost:4321/personal_site',
];

export function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS?.trim();
  if (!raw) return new Set(DEFAULT_ALLOWED_ORIGINS);

  return new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
  );
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: Set<string>) {
  if (!origin) return true;
  return allowedOrigins.has(origin);
}

export function buildCorsHeaders(
  origin: string | undefined,
  allowedOrigins: Set<string>,
  requestedHeaders: string | undefined
) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers':
      requestedHeaders?.trim() ||
      'Content-Type, Authorization, x-vercel-ai-ui-message-stream, User-Agent',
  };

  if (origin && allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }

  return headers;
}

export function applyHeaders(target: { setHeader: (name: string, value: string) => void }, headers: Record<string, string>) {
  Object.entries(headers).forEach(([name, value]) => {
    target.setHeader(name, value);
  });
}
