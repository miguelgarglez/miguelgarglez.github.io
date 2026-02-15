const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const rateLimitStore = new Map<string, { count: number; reset: number }>();

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  reset: number;
};

export function checkRateLimit(ip: string, now: number): RateLimitResult {
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

export function getRateLimitMax() {
  return RATE_LIMIT_MAX;
}

export function getClientIp(headers: Record<string, string | string[] | undefined>) {
  const xForwardedFor = headers['x-forwarded-for'];
  const headerValue = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
  if (!headerValue) return 'unknown';
  return headerValue.split(',')[0]?.trim() || 'unknown';
}
