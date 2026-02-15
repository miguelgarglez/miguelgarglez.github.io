# chat-backup-vercel

Secondary chat API for `personal_site`, deployed on Vercel.

## Endpoints

- `POST /chat` -> streaming response compatible with `x-vercel-ai-ui-message-stream: v1`
- `GET /healthz` -> `{ "ok": true, "backend": "vercel-fallback" }`

## Environment variables

Required:

- `CF_ACCOUNT_ID`
- `CF_API_TOKEN`

Optional:

- `WORKERS_AI_MODEL` (default: `@cf/meta/llama-3.1-8b-instruct`)
- `ALLOWED_ORIGINS` (comma-separated, defaults include `https://miguelgarglez.github.io` and localhost)

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
