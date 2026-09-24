export const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const FAILOVER_REASON_PATTERN = /^[a-z-]+(:\d{3})?$/;
const FAILOVER_REASON_MAX_LENGTH = 32;

export type ChatAttempt = 'primary' | 'secondary' | 'direct';

export function resolveRequestId(
  headerValue: string | null,
  generate: () => string = () => crypto.randomUUID()
): string {
  if (headerValue && REQUEST_ID_PATTERN.test(headerValue)) {
    return headerValue;
  }
  return generate();
}

export function parseChatAttempt(headerValue: string | null): ChatAttempt {
  if (headerValue === 'primary' || headerValue === 'secondary') {
    return headerValue;
  }
  return 'direct';
}

export function parseFailoverReason(headerValue: string | null): string | null {
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
  console.log(JSON.stringify({ event, backend: 'cloudflare', ...fields }));
}
