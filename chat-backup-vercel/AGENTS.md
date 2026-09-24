# AGENTS.md

Contexto: backend de backup en Vercel para el chat del `cv-chat`. Este servicio se usa como fallback cuando falla el endpoint primario de Cloudflare.

## Estructura

- `api/chat.ts`: endpoint principal de chat (streaming SSE compatible con AI SDK).
- `api/healthz.ts`: health check ligero.
- `api/index.ts`: metadata de servicio en `/`.
- `src/cors.ts`: validacion de origen y headers CORS.
- `src/rate-limit.ts`: rate limit en memoria por IP.
- `src/messages.ts`: parseo de body (`question` o `messages`) y extraccion de mensajes.
- `src/context.ts`: system prompt y contexto basado en `profile-data`.
- `src/errors.ts`: normalizacion de errores y politicas de retry/backoff.
- `src/ui-stream.ts`: adaptador de stream upstream -> protocolo `x-vercel-ai-ui-message-stream: v1`.
- `src/profile-data.ts`: base de conocimiento del perfil.

## Endpoints

- `GET /`: metadata JSON del servicio (no indexable).
- `GET /healthz`: `{ ok: true, backend: "vercel-fallback" }`.
- `POST /chat`: respuesta streaming SSE en formato UI message stream.

## Reglas de CORS

- Origenes permitidos se toman de `ALLOWED_ORIGINS` (CSV).
- Si `ALLOWED_ORIGINS` no existe, usar defaults:
  - `https://miguelgarglez.com`
  - `https://miguelgarglez.github.io`
  - `http://localhost:4321`
  - `http://localhost:4321/cv-chat`
- Requests con `Origin` no permitido -> `403`.

## Rate limiting

- Limite en memoria: 20 requests/minuto/IP.
- Fuente IP: `x-forwarded-for`.
- Respuesta `429` incluye:
  - `Retry-After`
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - JSON con `errorCode: WORKER_RATE_LIMIT`.

## Proveedor LLM OpenAI-compatible

Mismo proveedor que el Worker por decision explicita del usuario. Una caida
de Zen afecta ahora a ambos backends; es el trade-off aceptado.

- Secret obligatorio: `LLM_API_KEY`.
- Variables opcionales:
  - `LLM_PROVIDER` (default `opencode`)
  - `LLM_BASE_URL` (default `https://opencode.ai/zen/v1`)
  - `LLM_MODEL` (default `gpt-5.4-nano`)
  - `LLM_SITE_URL`
  - `LLM_APP_TITLE`
  - `SENTRY_DSN` (sin valor = Sentry desactivado)
  - `ALLOWED_ORIGINS`
- GPT 5.4 nano y el resto de modelos GPT/Grok/Muse Spark de Zen usan `/responses`, no `/chat/completions`.
- `src/upstream.ts` debe mantenerse identico a `chat-worker/src/agent/upstream.ts`
  (lo valida `chat-worker/test/upstream-copy.test.ts`).
- No usar variables `OPENROUTER_*` ni payload propietario de OpenRouter
  (`provider`, `models`, `allow_fallbacks`, etc.).

## Streaming (importante)

- Mantener compatibilidad con `x-vercel-ai-ui-message-stream: v1`.
- Emitir `finish` (no `end`).
- Errores en stream con `{ type: "error", errorText: "..." }`.
- Si no llegan bytes upstream, emitir error y evitar mensajes vacios.

## Notas de operacion

- Este backend es API-only; no sirve frontend.
- Incluir `X-Chat-Backend: vercel-fallback` en respuestas para trazabilidad.
- Mantener `GET /healthz` sin logica pesada para checks externos.
- Si cambia informacion del perfil, sincronizar `src/profile-data.ts` con `cv-chat`.
