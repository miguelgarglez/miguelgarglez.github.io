# Chat Worker Implementation Summary

## Goal

Cloudflare Worker that streams OpenRouter responses about Miguel Garcia's professional profile. Intended to be called from the Astro site hosted on GitHub Pages.

## What is implemented

- SSE streaming endpoint at `POST /chat`.
- Minimal RAG via keyword matching against a local profile dataset.
- Strict CORS allowlist to only allow production origin.
- Optional localhost access for dev via environment toggle.

## Files

- `chat-worker/src/index.ts`: Worker handler, CORS checks, request validation, OpenRouter streaming.
- `chat-worker/src/profile-data.ts`: Knowledge base derived from site content.
- `chat-worker/wrangler.toml`: Worker config (`workers_dev = true`, `preview_urls = false`).
- `chat-worker/AGENTS.md`: Local rules and operating notes.

## Request format

Accepts either format:

```json
{ "question": "..." }
```

or

```json
{ "messages": [{ "role": "user", "content": "..." }] }
```

## Streaming response

- Passes through OpenRouter SSE (`text/event-stream`).
- Client should parse `data:` lines and append `delta.content`.

## CORS behavior

- Allowed origin: `https://miguelgarglez.github.io`.
- If `DEV=true`, also allows:
  - `http://localhost:4321`
  - `http://localhost:3000`
  - `http://localhost:5173`
- Requests without `Origin` are rejected in prod; if `DEV=true`, empty Origin is allowed to support `curl` in dev.

## Env vars

Required:

- `OPENROUTER_API_KEY`

Optional:

- `OPENROUTER_MODEL` (defaults to `meta-llama/llama-3.3-70b-instruct:free`)
- `OPENROUTER_SITE_URL`
- `OPENROUTER_APP_TITLE`
- `DEV` (`true` to enable localhost + detailed upstream errors)

## Notes

- Designed to be dependency-free and low maintenance.
- RAG is intentionally basic; update `profile-data.ts` when the site content changes.
- For production, keep `DEV` unset.

## Rate limiting

- In-memory throttle: 20 requests per minute per IP.
- Uses `CF-Connecting-IP` (fallback to `X-Forwarded-For`).
- Responds with `429` and `Retry-After` / `X-RateLimit-*` headers.
- Best-effort only (not shared across instances, resets on worker recycle).

## Minimal client snippet (browser)

This consumes the SSE stream and appends deltas to a string.

```js
export async function streamChat({ question, endpoint, onDelta }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!response.ok || !response.body) {
    throw new Error('Chat request failed');
  }

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .getReader();

  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice('data: '.length).trim();
      if (!payload || payload === '[DONE]') continue;

      const json = JSON.parse(payload);
      const delta = json?.choices?.[0]?.delta?.content;
      if (delta) onDelta(delta);
    }
  }
}
```
