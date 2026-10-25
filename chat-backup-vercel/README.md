# chat-backup-vercel

Secondary chat API for `cv-chat`, deployed on Vercel.

This is the **failover** backend. The live site calls the Cloudflare Worker
first. On 502/timeout/etc. it retries this Vercel app, which by explicit
decision uses the **same provider** as the Worker (opencode Zen). The
trade-off: a Zen outage now affects both backends, but behavior, payload
shape, and error codes stay identical across primary and fallback.

The whole profile agent (intent, retrieval, prompts, suggested-prompt
contracts, rich-card parts, upstream payloads, UI stream and knowledge) is a
generated mirror of the Worker in `shared/profile-agent/`. Vercel deploys from
this directory and cannot import the Worker package, so after any change under
`chat-worker/src/agent`, `chat-worker/src/knowledge`, `chat-worker/src/ui-stream.ts`,
`shared/chat-parts.ts`, `cv-chat/src/data/experience.ts` or `src/data/projects.ts`
run `node scripts/sync-backup-agent.mjs`. `npm run test:profile-agent` fails if
the mirror drifts. Never edit `shared/profile-agent/` by hand.

## Endpoints

- `GET /` -> service metadata JSON
- `POST /chat` -> streaming response compatible with `x-vercel-ai-ui-message-stream: v1`
- `GET /healthz` -> `{ "ok": true, "backend": "vercel-fallback" }`

## Environment variables

Required:

- `LLM_API_KEY`

Optional:

- `LLM_PROVIDER` (default: `opencode`)
- `LLM_BASE_URL` (default: `https://opencode.ai/zen/v1`)
- `LLM_MODEL` (default: `gpt-5.4-nano`)
- `LLM_SITE_URL` (default: `https://miguelgarglez.com`)
- `LLM_APP_TITLE` (default: `Miguel Garcia Profile Chat`)
- `SENTRY_DSN` (unset = Sentry off)
- `ALLOWED_ORIGINS` (comma-separated, defaults include `https://miguelgarglez.com`, `https://miguelgarglez.github.io`, and localhost)

## Local checks

```bash
npm install
npm run typecheck
```

## Vercel setup

- Create a Vercel project with Root Directory `chat-backup-vercel`
- Enable auto-deploy from `main`
- Configure environment variables above
- Use the generated URL as `PUBLIC_CHAT_API_SECONDARY_URL`

## Frontend failover validation

- Browser-level failover testing (with request interception to simulate `timeout`/`429`/`503`/`504`) is documented at [`../docs/playwright-failover-testing.md`](../docs/playwright-failover-testing.md).
