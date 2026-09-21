---
title: "Observing a two-backend chat"
description: "How I added logs, request correlation and error tracking to a small AI chat that runs on a Cloudflare Worker with a Vercel fallback, and what I can now actually see."
date: 2026-09-21
kind: "article"
lang: "en"
tags: ["ai", "observability", "cloudflare", "sentry", "process"]
featured: false
draft: true
project: "cv-chat"
related: []
---

The chat on my CV page is small: one deterministic retrieval step, one LLM call, streamed back to the browser. It is also the only thing I run that strangers actually use, and for a long time I could not answer a basic question about it: how often does it fail, and where?

The architecture made that harder than it sounds. The primary backend is a Cloudflare Worker. If it times out or returns a server error, the browser retries against a Vercel function with a different provider. That failover is decided in the client, so neither backend knows the other one was involved. Each side had a few `console.log` lines, but the Worker's logs were not even being retained, and nothing tied a fallback request to the primary attempt that caused it.

## What I added

Three layers, each cheap enough to keep on a free plan.

**Structured logs on both backends.** Every `POST /chat` ends with exactly one `chat_request` event: outcome (`ok`, `upstream_error`, `upstream_unreachable`, `rate_limited`, ...), status, latency, provider, and which retrieval intent was detected. Turning on Cloudflare Workers Logs was a two-line change in `wrangler.toml`; the logs already existed, they just went nowhere.

**One request id across the whole turn.** The browser generates an id per message and sends it as `x-chat-request-id` to whichever backends it tries. When it fails over, it also sends `x-chat-attempt: secondary` and `x-chat-failover-reason: status:503` (or `timeout`, `network`, `primary-degraded`). The fallback logs a `failover_received` event with that reason. Both backends echo the id in `X-Chat-Request-Id`, so from a single header in DevTools I can find the primary's error and the fallback's response in two different dashboards.

The ids are validated against a strict pattern before being trusted; anything odd is replaced with a server-generated UUID. It is a small thing, but log injection through a header you invented yourself is an embarrassing bug to ship.

**Sentry for the failures that matter.** Uncaught exceptions, missing configuration, and upstream errors that are not rate limits. Events carry `backend`, `provider`, `errorCode`, `upstreamStatus` and the request id as tags, plus the git SHA as release, so "this started with deploy X" is a filter rather than a guess. Rate limits stay in logs only: they are expected, and an alert that fires on expected behaviour trains you to ignore it.

## What I deliberately left out

No question text, no answers, no upstream error bodies. The chat is anonymous and I want to keep it that way; the normalized error code and the upstream status are enough to act on. Sentry runs with PII collection off and no Session Replay.

I also kept the browser free of any monitoring SDK. The site is static on GitHub Pages and the chat is already the heaviest thing on the page. What the client contributes is the id and two headers.

## What I can see now

- The failover rate, and the reason distribution behind it: was the primary slow, down, or returning provider errors?
- Whether a fallback hit was caused by a real primary failure or by the five-minute cooldown after one.
- Provider-side problems (auth, quota) as a Sentry issue with a first-seen release, instead of a user telling me the chat is broken.
- Empty streams: the upstream connected but sent nothing, which the UI turns into an error rather than a blank message.

None of this is sophisticated. It is the minimum that turns "I think it works" into a set of questions I can answer by looking, which is what I wanted from a project that is supposed to represent how I build things.

The full runbook, including how to break each layer on purpose and what the resulting signals look like, lives in the repository as `docs/cv-chat-observability.md`.
