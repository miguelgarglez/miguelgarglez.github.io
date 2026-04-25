# AGENTS.md

Contexto del repo: sitio personal publicado en GitHub Pages. La home vive en Astro en la raíz del repo y actúa como directorio principal de proyectos, personas e ideas. `cv-chat` sigue siendo un subproyecto Astro independiente con mi perfil profesional y CV, con animaciones GSAP.

## Estructura

- `src/pages/index.astro`: pagina de entrada/directorio de proyectos.
- `src/components/`: componentes Astro de la home.
- `src/data/`: datos estructurados de proyectos y personas.
- `src/styles/global.css`: estilos globales de la home.
- `cv-chat/`: sitio Astro.
- `dist/`: salida generada de la home Astro, ignorada por git.
- `.github/workflows/deploy.yml`: workflow de deploy (si aplica).
- `.github/workflows/release-please.yml`: workflow de versionado semver y releases con PR.

## Tareas comunes

### Trabajar en la home Astro

- Usar `npm` como package manager en la raíz.
- Scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
- Añadir nuevas entradas de proyectos en `src/data/projects.ts`.
- Añadir nuevas entradas de personas en `src/data/people.ts`.
- Mantener el estilo visual actual salvo que se pida explícitamente rediseño.
- Revisar que los links apunten a rutas reales dentro del repo o a URLs validas.

### Trabajar en `cv-chat/`

- Seguir el stack actual (Astro + GSAP).
- Usar los scripts definidos en `cv-chat/package.json`:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
- Mantener el contenido en inglés.
- Respetar el estilo visual actual y las animaciones con scroll.

## Notas para agentes

- Antes de cambios, revisar `cv-chat/README.md` para contexto del sitio si existe.
- Si se agregan nuevos proyectos al directorio, considerar actualizar README del repo si es necesario.
- Iconos: se usa `astro-icon` con el set `@iconify-json/lucide`. La configuración está en `cv-chat/astro.config.mjs` (lista `include`). En componentes Astro, usar `<Icon name="lucide:icon-name" />` y evitar emojis/SVG inline.
- La fuente canónica del perfil es el contenido visible de `cv-chat`. `chat-worker/src/profile-data.ts` debe estar alineado con esa información, y puede incluir contenido complementario no visible en la web.
- Para que Release Please pueda abrir PRs, habilitar en GitHub: Actions permissions con "Read and write" y "Allow GitHub Actions to create and approve pull requests".
- Chat worker: el stream debe seguir el protocolo UI message stream del AI SDK. Emitir `finish` (no `end`) y errores como `{ type: "error", errorText: "..." }`. Si no hay bytes en el upstream, emitir error y no crear mensajes vacios.
