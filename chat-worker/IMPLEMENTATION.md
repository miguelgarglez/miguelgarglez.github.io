# Chat Worker Implementation Summary

## Goal

Cloudflare Worker that powers the `cv-chat` assistant. It answers questions about Miguel Garcia's professional profile through a fast, grounded, OpenAI-compatible LLM call.

The Worker intentionally keeps the runtime simple:

- one request from UI to Worker;
- one upstream LLM call per user message;
- deterministic context selection before the LLM call;
- AI SDK UI message stream output for the frontend.

## What Is Implemented

- `POST /chat` SSE endpoint.
- `GET /healthz` health endpoint.
- CORS allowlist for production origins, with localhost enabled by `DEV=true`.
- In-memory rate limiting.
- OpenAI-compatible upstream `/chat/completions` call.
- Retry and timeout handling for transient upstream failures.
- Conversion from OpenAI-style SSE to AI SDK UI message stream events.
- Lightweight profile agent runtime via `runProfileAgent()`.

## Agent Runtime

The Worker no longer builds a single ad hoc prompt directly in `index.ts`.
Instead, `runProfileAgent()` prepares model messages from deterministic context:

```text
question
  -> classifyAudience()
  -> classifyIntent()
  -> retrieveProfileFacts()
  -> retrieveProfileBlocks()
  -> retrieveProjects()
  -> retrieveMemories()
  -> buildContextText()
  -> one LLM call
```

The agent is not autonomous and does not run tool loops. This is deliberate: the chat should stay fast, predictable, cheap, and grounded.

## Knowledge Files

- `src/knowledge/profile-facts.ts`: critical facts that should not fail, such as current role, location, contact links, and primary stack.
- `src/knowledge/profile-data.ts`: longer profile blocks copied into the Worker so it does not depend on the Vercel fallback.
- `src/knowledge/projects.ts`: structured project knowledge with summaries, technologies, links, visibility, and priority.
- `src/knowledge/memories.ts`: curated public updates and learning notes.

Important positioning note: RAG is represented as lightweight practical exposure from the five-day Google GenAI Intensive capstone, not as deep production RAG experience.

## Files

- `src/index.ts`: Worker handler, CORS, rate limiting, upstream fetch, and stream conversion.
- `src/agent/run-profile-agent.ts`: agent orchestration.
- `src/agent/intent.ts`: heuristic intent and audience classification.
- `src/agent/*-retrieval.ts`: deterministic context retrieval.
- `src/agent/prompts.ts`: assistant policy and context formatting.
- `src/knowledge/*`: versioned professional profile knowledge.
- `test/profile-agent.test.ts`: retrieval regression tests.
- `wrangler.toml`: Worker config.
- `AGENTS.md`: local rules and operating notes.

## Request Format

Accepts either format:

```json
{ "question": "..." }
```

or AI SDK style messages:

```json
{ "messages": [{ "role": "user", "content": "..." }] }
```

## Streaming Response

The Worker emits AI SDK UI message stream events over `text/event-stream`:

- `start`
- `text-start`
- `text-delta`
- `text-end`
- `finish`
- `[DONE]`

Errors inside the stream are emitted as:

```json
{ "type": "error", "errorText": "..." }
```

The Worker avoids empty assistant messages. If the upstream sends zero bytes, it emits an error instead.

## Env Vars

Required:

- `LLM_API_KEY`
- `LLM_BASE_URL`
- `LLM_MODEL`

Optional:

- `LLM_PROVIDER`
- `LLM_SITE_URL`
- `LLM_APP_TITLE`
- `DEV` (`true` enables local CORS and more detailed upstream errors)

Do not use legacy `OPENROUTER_*` variables in this Worker.

## Testing

Run the profile-agent regression suite from the repository root:

```bash
npm run test:profile-agent
```

The tests bundle the TypeScript test file with the existing local `esbuild` package and run Node's built-in test runner. They do not install packages and do not call the LLM.

Current covered behaviors:

- Spanish current-role question selects the current role fact and `experience-ods`.
- Contact questions include LinkedIn and X facts.
- AI project questions include `cv-chat` and relevant AI memories.
- RAG questions are framed as lightweight Google GenAI Intensive capstone exposure.
- Frontend experience questions include current role and frontend skills.

## CORS Behavior

- Production origins:
  - `https://miguelgarglez.github.io`
  - `https://miguelgarglez.com`
- If `DEV=true`, also allows:
  - `http://localhost:4321`
  - `http://127.0.0.1:4321`
- Requests without `Origin` are rejected for `POST /chat` in prod; `GET /` and `GET /healthz` remain available for health checks.

## Rate Limiting

- In-memory throttle: 20 requests per minute per IP.
- Uses `CF-Connecting-IP`, falling back to `X-Forwarded-For`.
- Responds with `429`, `Retry-After`, and `X-RateLimit-*` headers.
- Best-effort only: the limit is not shared across Worker instances and resets when an instance recycles.

## Maintenance Notes

- Keep `chat-backup-vercel` intact unless explicitly changing the fallback.
- Keep the Worker dependency-light and avoid adding runtime storage until the knowledge base is too large for static files.
- Add or update profile-agent tests when changing retrieval behavior or professional positioning.
- Keep public knowledge factual and conservative. Do not overstate project depth, metrics, availability, or private work.
