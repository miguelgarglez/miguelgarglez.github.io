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
npx wrangler secret put OPENROUTER_SITE_URL
npx wrangler secret put OPENROUTER_APP_TITLE
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
- Body: { "question": "..." } or { "messages": [{ "role": "user", "content": "..." }] }
- Streaming response: text/event-stream (OpenRouter SSE passthrough)
