# AGENTS.md

Contexto: Worker de Cloudflare que hace streaming SSE hacia un proveedor LLM OpenAI-compatible para responder preguntas sobre el perfil profesional. Se consume desde el sitio Astro en GitHub Pages.

## Estructura

- `src/index.ts`: handler principal, CORS, validacion de origen, streaming.
- `src/profile-data.ts`: base de conocimiento (contenido del CV y secciones).
- `wrangler.toml`: config del worker.

## Reglas de CORS

- Produccion: solo se permite `https://miguelgarglez.github.io`.
- Desarrollo local: habilitar `DEV=true` en el entorno para permitir `localhost`.
- Requests sin `Origin` se bloquean en prod; si `DEV=true`, se permiten para facilitar `curl` en dev.

## Rate limiting

- Limite en memoria: 20 requests por minuto por IP.
- Usa `CF-Connecting-IP` (fallback a `X-Forwarded-For`).
- Responde `429` con headers `Retry-After` y `X-RateLimit-*`.
- Es best-effort: no se comparte entre instancias y se resetea al reciclar el worker.

## Proveedor LLM OpenAI-compatible

- Secret obligatorio: `LLM_API_KEY`.
- Variables requeridas:
  - `LLM_PROVIDER`
  - `LLM_BASE_URL`
  - `LLM_MODEL`
- Proveedor actual: opencode Zen.
- Base URL actual: `https://opencode.ai/zen/v1`.
- Modelo actual: `nemotron-3-super-free`.
- Mantener `stream: true` para UX de chat.
- `DEV=true` permite CORS local y respuestas con detalle de errores upstream.
- No usar variables `OPENROUTER_*` en este Worker.
- No incluir payload propietario de OpenRouter (`provider`, `models`, `allow_fallbacks`, etc.).

## RAG

- RAG basico por keywords en `buildContext`.
- Si se cambia contenido del sitio, actualizar `src/profile-data.ts`.

## Notas

- Evitar dependencias extra; mantener el worker simple.
- No exponer claves en frontend.
