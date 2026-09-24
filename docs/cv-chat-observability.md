# CV Chat Observability and Tracing

This guide explains how the two-backend chat (Cloudflare Worker primary,
Vercel fallback) is observed, how a single conversation turn can be traced
across both backends, how to break it on purpose, and where to look
afterwards.

Related: [`playwright-failover-testing.md`](./playwright-failover-testing.md)
(forcing failover from a real browser),
[`cv-chat-agent-maintenance.md`](./cv-chat-agent-maintenance.md).

## The three layers

| Layer | What it is | Where it lives | Cost |
| --- | --- | --- | --- |
| Structured logs | One JSON line per event (`console.log`) on both backends | Cloudflare Workers Logs; Vercel runtime logs | Included in Cloudflare Free (200k log events/day, 3-day retention) and Vercel Hobby |
| Request correlation | One `requestId` generated in the browser and carried through every attempt, response header and log line | `x-chat-*` request headers, `X-Chat-Request-Id` response header | Code only |
| Sentry | Operational failures (upstream down, auth/quota errors, config missing, uncaught exceptions) with tags, release and environment | Sentry Developer plan (free, 1 user) | Free |

Logs answer *what happened on each request*. Correlation answers *which
requests belong to the same user turn*. Sentry answers *is something broken
right now, since which deploy, how often*.

## How a request flows

```text
browser (Chat.tsx)
  requestId = nanoid()
  |
  |-- POST primary /chat
  |     x-chat-request-id: <id>
  |     x-chat-attempt: primary
  |       -> Worker logs chat_request{outcome, ttfbMs|durationMs}
  |       -> response: X-Chat-Backend: cloudflare, X-Chat-Request-Id: <id>
  |
  |-- (only if primary failed: timeout / network / 408,429,5xx)
      POST secondary /chat
        x-chat-request-id: <id>          (same id)
        x-chat-attempt: secondary
        x-chat-failover-reason: status:503 | timeout | network | primary-degraded
          -> Vercel logs failover_received{failoverReason}
          -> Vercel logs chat_request{...}
          -> response: X-Chat-Backend: vercel-fallback, X-Chat-Request-Id: <id>
```

Notes:

- The id is generated client-side so that both backends see the *same* id
  for one user turn. Backends only accept ids matching
  `^[A-Za-z0-9_-]{8,64}$`; anything else is replaced by a server-generated
  UUID, so a hostile header cannot inject arbitrary content into logs.
- `x-chat-attempt` is `primary`, `secondary`, or (when the header is absent,
  e.g. `curl`) `direct`.
- `primary-degraded` means the browser skipped the primary entirely because
  it failed within the last 5 minutes (`PRIMARY_DEGRADED_MS`).
- `Access-Control-Expose-Headers` lets the browser read `X-Chat-Backend`,
  `X-Chat-Request-Id` and `Retry-After` in DevTools and scripts.

## Events emitted

Both backends emit the same event names; the `backend` field is
`cloudflare` or `vercel-fallback`.

| Event | When | Key fields |
| --- | --- | --- |
| `chat_request` | Exactly once per `POST /chat`, on the exit path | `requestId`, `attempt`, `failoverReason`, `outcome`, `status`, `durationMs` (or `ttfbMs` for `ok`), plus outcome-specific fields |
| `chat_stream_end` | When the SSE stream to the browser finishes | `requestId`, `receivedBytes`, `errorSent`, `durationMs` |
| `failover_received` | Vercel only, when `attempt === "secondary"` | `requestId`, `failoverReason` |
| `profile_agent_context` | Worker only, after deterministic retrieval | `intent`, `audience`, selected fact/block/project/memory ids |
| `upstream_error` | Upstream returned a non-2xx | `provider`, `api`, `upstreamStatus`, `errorCode`, `attempts` |

`chat_request.outcome` values: `ok`, `rate_limited`, `bad_request`,
`config_missing`, `upstream_unreachable` (timeout or network failure after
retries), `upstream_error` (non-2xx after retries).

For `ok`, `ttfbMs` is the time until the upstream started streaming, not the
whole answer; the total is in `chat_stream_end.durationMs`.

### What is deliberately not logged

- The question text, message history, or any generated text.
- Upstream error bodies (`detail`). Only the normalized `errorCode` and
  `upstreamStatus` survive.
- IPs and user agents (Cloudflare's own invocation log already records the
  request metadata under its retention rules).

## Sentry

Sentry is wired but **disabled until a DSN is configured**. Without
`SENTRY_DSN` both SDKs are no-ops.

What gets captured:

- Uncaught exceptions on the Worker (via `Sentry.withSentry`) and on Vercel
  (`@sentry/node` default integrations).
- `captureMessage` for `config_missing`, `upstream_unreachable`, and
  `upstream_error` **except** upstream 429s (rate limits are expected noise;
  they stay in logs).
- Tags on every event: `backend`, `attempt`, `provider`, `api`, `errorCode`,
  `upstreamStatus`, `chat.request_id`. Search `chat.request_id:<id>` in
  Sentry to jump from a log line to its issue.
- `release` = git SHA (`SENTRY_RELEASE` via `--var` in the deploy workflow on
  Cloudflare; `VERCEL_GIT_COMMIT_SHA` on Vercel). Regressions show as "first
  seen in release X".
- `environment` = `production` / `development` (Worker `DEV=true`) or the
  `VERCEL_ENV` value.
- Worker tracing is on (`tracesSampleRate: 1.0`), so each request also
  produces a trace with the upstream `fetch` span and its latency. Vercel
  sends errors only.

Privacy settings: `sendDefaultPii: false`, request bodies and GenAI
inputs/outputs excluded (`dataCollection`), no Session Replay.

### Enabling Sentry

1. Create a free Sentry account and one project of type *Cloudflare Workers*
   (or generic JavaScript). Copy the DSN. Reusing the same project for both
   backends is fine: the `backend` tag separates them.
2. Cloudflare: `cd chat-worker && npx wrangler secret put SENTRY_DSN`.
3. Vercel: Project Settings -> Environment Variables -> `SENTRY_DSN`
   (Production, and Preview if you want). Redeploy.
4. Trigger a test failure (below) and confirm the issue appears.

Budget: the Developer plan resets monthly; if quota is exceeded Sentry drops
events until the next period, it never bills.

## Enabling Workers Logs

Already enabled in `chat-worker/wrangler.toml`:

```toml
[observability]
enabled = true
head_sampling_rate = 1
```

It takes effect on the next `wrangler deploy`. Logs are in the Cloudflare
dashboard: Workers & Pages -> `miguel-chat-worker` -> Logs. Filter by the JSON
fields directly, e.g. `event = chat_request AND outcome != ok`.

Vercel logs: project -> Logs (or `vercel logs <deployment>`). Each
`console.log` line is one JSON object.

## Reproducing failures on purpose

### 1. Request id passthrough (no deploy needed)

```bash
cd chat-worker && npx wrangler dev --port 8787 --var DEV:true
```

```bash
curl -si -X POST http://127.0.0.1:8787/chat \
  -H 'content-type: application/json' \
  -H 'x-chat-request-id: manual-test-0001' \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

Expected: `X-Chat-Request-Id: manual-test-0001` in the response, and in the
`wrangler dev` output a `chat_request` line with the same `requestId` and
`outcome: "config_missing"` (no LLM secrets locally). Repeat without the
header: the response carries a generated UUID.

### 2. Upstream failure on the primary

Temporarily point the Worker at a broken upstream and deploy (or run
`wrangler dev` with `--var LLM_BASE_URL:https://httpstat.us/503`):

- Expect `chat_request{outcome:"upstream_error", upstreamStatus:503,
  errorCode:"UPSTREAM_ERROR", attempts:3}` after ~3 retries.
- Expect a Sentry issue titled "Upstream error" tagged
  `backend:cloudflare errorCode:UPSTREAM_ERROR`.
- Point it to a non-routable host to get `upstream_unreachable` /
  `UPSTREAM_REQUEST_FAILED` instead.

### 3. Browser failover end to end

Use the Playwright interception from
[`playwright-failover-testing.md`](./playwright-failover-testing.md) to make
the primary return 503, or simply block the Worker host in DevTools
(Network -> Block request URL). Then send a message and check:

- DevTools Network: two `chat` requests with the *same*
  `x-chat-request-id`; the second has `x-chat-attempt: secondary` and
  `x-chat-failover-reason: status:503` (or `network`).
- The successful response has `X-Chat-Backend: vercel-fallback`.
- Vercel logs: `failover_received` and `chat_request{attempt:"secondary"}`
  for that id.
- Send a second message within 5 minutes: it goes straight to the fallback
  with `x-chat-failover-reason: primary-degraded`.

### 4. Rate limit

Send 21 requests within a minute from one IP to the Worker: the 21st returns
429 and logs `chat_request{outcome:"rate_limited"}`. No Sentry event is
expected (by design).

## Reading the signals

| You see | It means |
| --- | --- |
| `X-Chat-Backend: cloudflare`, `chat_request.outcome=ok` on Cloudflare | Normal path |
| `X-Chat-Backend: vercel-fallback` + Vercel `failover_received{failoverReason:"status:5xx"}` | Primary answered with an error; browser failed over. Look up the same `requestId` in Cloudflare logs to see *why* (`upstream_error` / `upstream_unreachable`) |
| `failover_received{failoverReason:"timeout"}` with **no** Cloudflare `chat_request` for that id | Primary never answered within 15 s (Worker itself slow or unreachable), or the Worker log is still pending. If the Cloudflare line shows up later with `outcome:ok` and a large `ttfbMs`, the upstream was slow, not down |
| `failover_reason:"network"` | DNS/TLS/connection failure to the Worker from the browser; check Cloudflare status |
| `failover_reason:"primary-degraded"` | No primary attempt was made; the browser is in the 5-minute cooldown after an earlier failure |
| Sentry issue on `vercel-fallback` **and** on `cloudflare` with the same `chat.request_id` | Both backends failed for one turn: the user saw an error |
| Sentry "Upstream error" `errorCode:UPSTREAM_AUTH` | Provider key expired or revoked; rotate `LLM_API_KEY` |
| `UPSTREAM_QUOTA_EXCEEDED` | Provider credits exhausted |
| `chat_stream_end{receivedBytes:0, errorSent:true}` | Upstream connected but streamed nothing; the UI showed an error instead of an empty bubble |

## Configuration reference

| Setting | Where | Default |
| --- | --- | --- |
| `SENTRY_DSN` | Worker secret / Vercel env | unset (Sentry off) |
| `SENTRY_RELEASE` | `--var` in `.github/workflows/deploy.yml` | git SHA; falls back to `CF_VERSION_METADATA.id` |
| `observability.head_sampling_rate` | `chat-worker/wrangler.toml` | `1` (log every request) |
| `tracesSampleRate` (Worker) | `chat-worker/src/index.ts` | `1.0`; lower if the Sentry span quota is hit |
| `nodejs_compat` flag | `chat-worker/wrangler.toml` | required by `@sentry/cloudflare` (AsyncLocalStorage) |

## Maintenance notes

- `chat-worker` now has its own `package.json` (`@sentry/cloudflare`,
  `wrangler`), and the deploy job runs `npm ci` before `wrangler deploy`.
  This is the one deliberate exception to "no extra dependencies" in the
  Worker; keep it to Sentry.
- Parsing helpers (`resolveRequestId`, `parseChatAttempt`,
  `parseFailoverReason`) are duplicated in
  `chat-worker/src/telemetry.ts` and `chat-backup-vercel/src/telemetry.ts`
  on purpose (separate deployables). Keep them identical; the Worker copy is
  covered by `chat-worker/test/telemetry.test.ts`.
