# AGENTS.md

Contexto: Worker de Cloudflare que hace streaming SSE hacia un proveedor LLM OpenAI-compatible para responder preguntas sobre el perfil profesional. Se consume desde el sitio Astro en GitHub Pages.

## Estructura

- `src/index.ts`: handler principal, CORS, validacion de origen, streaming.
- `src/agent/`: runtime determinista del agente de perfil.
- `src/knowledge/profile-facts.ts`: facts criticos que no deberian fallar (puesto actual, contacto, stack, ubicacion).
- `src/knowledge/profile-data.ts`: bloques largos de perfil y CV.
- `src/knowledge/projects.ts`: proyectos estructurados.
- `src/knowledge/memories.ts`: memorias publicas curadas.
- `test/profile-agent.test.ts`: regresiones de retrieval del agente.
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
- Modelo actual: configurado por `LLM_MODEL` (mantener gpt-5.4-nano/opencode Zen si sigue siendo el modelo productivo elegido).
- Mantener `stream: true` para UX de chat.
- `DEV=true` permite CORS local y respuestas con detalle de errores upstream.
- No usar variables `OPENROUTER_*` en este Worker.
- No incluir payload propietario de OpenRouter (`provider`, `models`, `allow_fallbacks`, etc.).

## Runtime agentic

- El Worker usa `runProfileAgent()` para clasificar audiencia/intencion y seleccionar contexto.
- Mantener una sola llamada LLM por mensaje.
- No introducir tool loops, KV, D1, Vectorize o MCP runtime sin una razon clara.
- El contexto se compone de facts criticos, bloques de perfil, proyectos y memorias.
- Si cambia contenido del sitio o posicionamiento profesional, actualizar `src/knowledge/*`.
- Para mantener alineados prompts visibles, knowledge y tests, seguir `../docs/cv-chat-agent-maintenance.md`.
- La experiencia RAG debe describirse como exposicion ligera y practica del Google GenAI Intensive de 5 dias con capstone, no como experiencia RAG productiva profunda.

## Tests

- Ejecutar desde la raiz: `npm run test:profile-agent`.
- Estos tests no llaman al LLM; validan que `runProfileAgent()` entrega el contexto correcto.
- Anadir regresiones cuando se detecte una pregunta importante que seleccione mal el contexto.

## Notas

- Evitar dependencias extra; mantener el worker simple.
- No exponer claves en frontend.
