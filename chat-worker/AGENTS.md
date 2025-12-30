# AGENTS.md

Contexto: Worker de Cloudflare que hace streaming SSE hacia OpenRouter para responder preguntas sobre el perfil profesional. Se consume desde el sitio Astro en GitHub Pages.

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

## OpenRouter

- Secret obligatorio: `OPENROUTER_API_KEY`.
- Opcionales: `OPENROUTER_MODEL`, `OPENROUTER_SITE_URL`, `OPENROUTER_APP_TITLE`.
- Mantener `stream: true` para UX de chat.
- `DEV=true` permite respuestas con detalle de errores upstream.

## RAG

- RAG basico por keywords en `buildContext`.
- Si se cambia contenido del sitio, actualizar `src/profile-data.ts`.

## Notas

- Evitar dependencias extra; mantener el worker simple.
- No exponer claves en frontend.
