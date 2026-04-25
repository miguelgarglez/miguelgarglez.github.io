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
# gpt-5.4-nano or the exact opencode Zen model id configured for production

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

## Agent context tests

The Worker builds a deterministic context before making the single LLM call.
Run the retrieval regression suite from the repository root:

```bash
npm run test:profile-agent
```

These tests protect critical context selection for questions about current role,
contact, AI projects, lightweight RAG/GenAI exposure, and frontend experience.
They do not call the LLM.

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
- Runtime: `runProfileAgent()` selects profile facts, profile blocks, projects,
  and memories before the LLM call.
- Knowledge files live under `src/knowledge/`.
- Error JSON includes `errorCode` and `source`
- Responses include `X-Chat-Backend: cloudflare`
- Do not expose `LLM_API_KEY` in frontend
