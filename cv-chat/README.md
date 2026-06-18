# cv-chat

Digital CV with chat built with Astro.

## Package manager

This project is standardized on `npm`.

- Use `package-lock.json` as the canonical lockfile.
- Do not use `pnpm` or commit `pnpm-lock.yaml` for this app.
- CI installs dependencies with `npm ci`.

## Recommended environment

- Node.js `22+`
- npm `10+`

## Install

```bash
npm install
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

Run commands from `/Users/miguelgarglez/Developer/miguelgarglez.github.io/cv-chat`.

## Local chat dev (frontend + Cloudflare worker)

From the repository root:

```bash
npm run dev:cv-chat
```

This starts:

1. `chat-worker` with `wrangler dev` on `http://127.0.0.1:8787`
2. `cv-chat` on `http://localhost:4321/cv-chat/`

One-time setup:

```bash
cp cv-chat/.env.example cv-chat/.env
cp chat-worker/.dev.vars.example chat-worker/.dev.vars
# Edit chat-worker/.dev.vars and set LLM_API_KEY
```

Manual alternative:

```bash
# terminal 1
cd chat-worker
set -a && source .dev.vars && set +a   # or: source .env
npx wrangler dev

# terminal 2
cd cv-chat
npm run dev
```

Quick worker check:

```bash
curl -sf http://127.0.0.1:8787/healthz
```
