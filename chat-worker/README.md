# Chat Worker (Cloudflare)

Minimal Cloudflare Worker that streams answers about Miguel Garcia using OpenRouter.

## Setup

1. Install Wrangler (if not already installed).
2. Create the Worker and set secrets:

```bash
npx wrangler login
npx wrangler secret put OPENROUTER_API_KEY
```

Optional variables:

```bash
npx wrangler secret put OPENROUTER_MODEL
npx wrangler secret put OPENROUTER_FALLBACK_MODELS
npx wrangler secret put OPENROUTER_SITE_URL
npx wrangler secret put OPENROUTER_APP_TITLE
```

Suggested model setup for higher free-tier resiliency:

```bash
# Primary model router for free models
npx wrangler secret put OPENROUTER_MODEL
# value: openrouter/free

# Comma-separated fallback chain used if the primary fails/rate-limits
npx wrangler secret put OPENROUTER_FALLBACK_MODELS
# value: stepfun/step-3.5-flash:free,arcee-ai/trinity-large-preview:free,nvidia/nemotron-3-nano-30b-a3b:free
```

Dev-only variable:

```bash
DEV=true
```

## Local dev

```bash
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy
```

## Test (streaming)

```bash
curl -N \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Miguel current role?"}' \
  http://127.0.0.1:8787/chat
```

## Notes

- Endpoint: POST /chat
- Health endpoint: GET /healthz
- Body: { "question": "..." } or { "messages": [{ "role": "user", "content": "..." }] }
- Streaming response: text/event-stream (OpenRouter SSE passthrough)
- Resilience defaults:
  - `model: openrouter/free`
  - fallback models via `models`
  - provider routing with `allow_fallbacks: true` and `sort: throughput`
  - automatic retries for transient upstream errors (`408/429/5xx`) with exponential backoff
- Error JSON includes `errorCode` and `source` so the frontend can distinguish worker vs OpenRouter limits.
- Responses include `X-Chat-Backend: cloudflare` for backend tracing in failover setups.
