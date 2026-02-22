# Frontend Failover Testing with Playwright

This guide documents how to test chat failover in a real browser by intercepting network calls at runtime.

## Why this approach

- You validate real user behavior (UI + network), not only backend responses.
- You can force exact failure modes (`429`, `503`, `504`, timeout) without breaking production services.
- Scenarios are deterministic and repeatable.

## Core pattern

Use Playwright request interception on the primary chat endpoint:

```ts
await page.route("**/miguel-chat-worker.miguel-garglez.workers.dev/chat", async (route) => {
  await route.fulfill({
    status: 429,
    contentType: "application/json; charset=utf-8",
    headers: {
      "access-control-allow-origin": "https://miguelgarglez.github.io",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers":
        "Content-Type, Authorization, x-vercel-ai-ui-message-stream, User-Agent",
      "retry-after": "30",
      "x-chat-backend": "cloudflare"
    },
    body: JSON.stringify({
      error: "Provider rate limit reached",
      errorCode: "UPSTREAM_RATE_LIMIT",
      source: "provider",
      retryAfterSeconds: 30
    })
  });
});
```

For timeout simulation:

```ts
await page.route("**/miguel-chat-worker.miguel-garglez.workers.dev/chat", (route) =>
  route.abort("timedout")
);
```

## Manual validation flow

1. Open `https://miguelgarglez.github.io/personal_site/` in Playwright.
2. Register one route interception rule for the primary endpoint.
3. Open chat and send one message.
4. Verify network sequence:
   - first request to Cloudflare primary fails (`timeout`, `429`, `503`, `504`)
   - second request to Vercel secondary succeeds (`200`)
5. Verify UI: assistant response appears (or expected final error if both fail).

## Scenarios to run

- `timeout` on primary -> fallback to secondary.
- `429` on primary -> fallback to secondary.
- `503` on primary -> fallback to secondary.
- `504` on primary -> fallback to secondary.
- Optional: force both endpoints to fail -> confirm user-facing error message with contact links.

## Important notes

- Keep CORS headers in mocked responses, otherwise browser behavior can differ from real backend failures.
- Interception is session-scoped; it does not change deployed infrastructure.
- Re-run tests after changing:
  - chat failover logic (`personal_site/src/components/chat/Chat.tsx`)
  - endpoint wiring (`personal_site/src/components/chat/ChatLauncher.astro`)
  - backend contracts (`chat-worker` or `chat-backup-vercel`)
