import * as Sentry from '@sentry/node';

export const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const FAILOVER_REASON_PATTERN = /^[a-z-]+(:\d{3})?$/;
const FAILOVER_REASON_MAX_LENGTH = 32;

export type ChatAttempt = 'primary' | 'secondary' | 'direct';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}

export function resolveRequestId(
  headerValue: string | null | undefined,
  generate: () => string = () => crypto.randomUUID()
): string {
  if (headerValue && REQUEST_ID_PATTERN.test(headerValue)) {
    return headerValue;
  }
  return generate();
}

export function parseChatAttempt(headerValue: string | null | undefined): ChatAttempt {
  if (headerValue === 'primary' || headerValue === 'secondary') {
    return headerValue;
  }
  return 'direct';
}

export function parseFailoverReason(headerValue: string | null | undefined): string | null {
  if (
    headerValue &&
    headerValue.length <= FAILOVER_REASON_MAX_LENGTH &&
    FAILOVER_REASON_PATTERN.test(headerValue)
  ) {
    return headerValue;
  }
  return null;
}

export function logEvent(event: string, fields: Record<string, unknown>): void {
  console.log(JSON.stringify({ event, backend: 'vercel-fallback', ...fields }));
}

export function setTelemetryTag(key: string, value: string): void {
  if (!process.env.SENTRY_DSN) return;
  Sentry.setTag(key, value);
}

export function captureOperationalIssue(
  message: string,
  tags: Record<string, string> = {},
  extra: Record<string, unknown> = {}
): void {
  if (!process.env.SENTRY_DSN) return;
  Sentry.captureMessage(message, {
    level: 'error',
    tags: { backend: 'vercel-fallback', ...tags },
    extra,
  });
}

export async function flushTelemetry(): Promise<void> {
  if (!process.env.SENTRY_DSN) return;
  await Sentry.flush(2000);
}
