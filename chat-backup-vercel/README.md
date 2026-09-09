# chat-backup-vercel

Secondary chat API for `cv-chat`, deployed on Vercel.

This is the **failover** backend. The live site calls the Cloudflare Worker
first (opencode Zen). On 502/timeout/etc. it retries this Vercel app, which
uses **OpenRouter**, not opencode. That split is intentional: if Zen is the
thing failing, the backup should not depend on the same provider.

Profile blocks in `shared/chat-context/profile-data.ts` must stay identical to
`chat-worker/src/knowledge/profile-data.ts`. The fallback cannot import the
Worker package because Vercel deploys from this directory.

## Endpoints

- `GET /` -> service metadata JSON
- `POST /chat` -> streaming response compatible with `x-vercel-ai-ui-message-stream: v1`
- `GET /healthz` -> `{ "ok": true, "backend": "vercel-fallback" }`

## Environment variables

Required:

- `OPENROUTER_API_KEY`

Optional:

- `OPENROUTER_MODEL` (default: `openrouter/free`)
- `OPENROUTER_FALLBACK_MODELS` (CSV fallback chain)
- `OPENROUTER_SITE_URL` (default: `https://miguelgarglez.com`)
- `OPENROUTER_APP_TITLE` (default: `Miguel Garcia Profile Chat`)
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
