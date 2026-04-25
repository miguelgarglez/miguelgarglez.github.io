# Chat Worker (Cloudflare)

Cloudflare Worker that streams answers about Miguel Garcia using an OpenAI-compatible LLM provider.
The current primary provider is opencode Zen.

## Setup

```bash
npx wrangler login

npx wrangler secret put LLM_PROVIDER
# opencode

npx wrangler secret put LLM_API_KEY
# your opencode Zen API key

npx wrangler secret put LLM_BASE_URL
# https://opencode.ai/zen/v1

npx wrangler secret put LLM_MODEL
# nemotron-3-super-free

npx wrangler secret put LLM_SITE_URL
# https://miguelgarglez.github.io

npx wrangler secret put LLM_APP_TITLE
# Miguel Garcia Profile Chat
```

Dev-only variable:

```env
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

## Test streaming

```bash
curl -N \
  -H "Content-Type: application/json" \
  -H "x-vercel-ai-ui-message-stream: v1" \
  -d '{"question":"What is Miguel current role?"}' \
  http://127.0.0.1:8787/chat
```

## Notes

- Endpoint: `POST /chat`
- Health endpoint: `GET /healthz`
- Body: `{ "question": "..." }` or AI SDK `messages`
- Streaming response: `text/event-stream`
- Upstream: OpenAI-compatible `/chat/completions`
- Error JSON includes `errorCode` and `source`
- Responses include `X-Chat-Backend: cloudflare`
- Do not expose `LLM_API_KEY` in frontend
