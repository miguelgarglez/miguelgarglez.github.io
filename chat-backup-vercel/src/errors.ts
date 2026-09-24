const RETRYABLE_UPSTREAM_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const RETRY_BASE_MS = 500;
const RETRY_MAX_MS = 6_000;

export type NormalizedErrorCode =
  | 'WORKER_RATE_LIMIT'
  | 'UPSTREAM_RATE_LIMIT'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_REQUEST_FAILED'
  | 'UPSTREAM_QUOTA_EXCEEDED'
  | 'UPSTREAM_AUTH'
  | 'UPSTREAM_BAD_REQUEST'
  | 'UPSTREAM_ERROR';

export function parseRetryAfterMs(value: string | null) {
  if (!value) return null;
  const seconds = Number(value);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }
  const dateMs = Date.parse(value);
  if (Number.isNaN(dateMs)) return null;
  return Math.max(0, dateMs - Date.now());
}

export function computeBackoffMs(attempt: number, retryAfterMs: number | null) {
  if (retryAfterMs !== null) {
    return Math.min(retryAfterMs, RETRY_MAX_MS);
  }

  const base = RETRY_BASE_MS * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(base + jitter, RETRY_MAX_MS);
}

export function shouldRetryStatus(status: number) {
  return RETRYABLE_UPSTREAM_STATUS.has(status);
}

export function extractUpstreamError(detail: string) {
  try {
    const parsed = JSON.parse(detail) as Record<string, unknown>;
    const error = parsed.error as Record<string, unknown> | undefined;
    const message = error?.message;
    const code = error?.code;

    if (
      typeof message === 'string' &&
      (typeof code === 'number' || typeof code === 'string')
    ) {
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

export function normalizeUpstreamFailure(
  upstreamStatus: number,
  upstreamDetail: string,
  retryAfterMs: number | null,
  includeDebug: boolean,
  attempts: number
) {
  const parsed = extractUpstreamError(upstreamDetail);
  let status = 502;
  let error = 'Upstream error.';
  let errorCode: NormalizedErrorCode = 'UPSTREAM_ERROR';

  if (upstreamStatus === 429) {
    status = 429;
    error = 'Upstream rate limit exceeded.';
    errorCode = 'UPSTREAM_RATE_LIMIT';
  } else if (upstreamStatus === 402) {
    status = 503;
    error = 'Upstream quota exceeded.';
    errorCode = 'UPSTREAM_QUOTA_EXCEEDED';
  } else if (upstreamStatus === 401 || upstreamStatus === 403) {
    error = 'Upstream authentication failed.';
    errorCode = 'UPSTREAM_AUTH';
  } else if (upstreamStatus === 400) {
    error = 'Upstream rejected the request.';
    errorCode = 'UPSTREAM_BAD_REQUEST';
  }

  return {
    status,
    payload: includeDebug
      ? {
          error,
          errorCode,
          source: 'llm',
          upstreamStatus,
          detail: parsed?.message ?? upstreamDetail,
          upstreamCode: parsed?.code,
          attempts,
          retryAfterSeconds:
            retryAfterMs !== null ? Math.max(1, Math.ceil(retryAfterMs / 1000)) : null,
        }
      : {
          error,
          errorCode,
          source: 'llm',
          upstreamStatus,
          upstreamCode: parsed?.code,
          retryAfterSeconds:
            retryAfterMs !== null ? Math.max(1, Math.ceil(retryAfterMs / 1000)) : null,
        },
  };
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
