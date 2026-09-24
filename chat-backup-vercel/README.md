# chat-backup-vercel

Secondary chat API for `cv-chat`, deployed on Vercel.

This is the **failover** backend. The live site calls the Cloudflare Worker
first. On 502/timeout/etc. it retries this Vercel app, which by explicit
decision uses the **same provider** as the Worker (opencode Zen). The
trade-off: a Zen outage now affects both backends, but behavior, payload
shape, and error codes stay identical across primary and fallback.

Profile blocks in `shared/chat-context/profile-data.ts` must stay identical to
`chat-worker/src/knowledge/profile-data.ts`. The fallback cannot import the
Worker package because Vercel deploys from this directory.

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
