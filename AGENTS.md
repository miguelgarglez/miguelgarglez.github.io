# AGENTS.md

Contexto del repo: sitio personal publicado en GitHub Pages. La home vive en Astro en la raíz del repo y actúa como directorio principal de proyectos, personas e ideas. `cv-chat` sigue siendo un subproyecto Astro independiente con mi perfil profesional y CV, con animaciones GSAP.

## Estructura

- `src/pages/index.astro`: pagina de entrada/directorio de proyectos.
- `src/components/`: componentes Astro de la home.
- `src/data/`: datos estructurados de proyectos y personas.
- `src/styles/global.css`: estilos globales de la home.
- `cv-chat/`: sitio Astro.
- `dist/`: salida generada de la home Astro, ignorada por git.
- `.cursor/environment.json`: entorno de Cursor Cloud Agents (install, terminals, ports).
- `.github/workflows/deploy.yml`: workflow de deploy (si aplica).
- `.github/workflows/release-please.yml`: workflow de versionado semver y releases con PR.

## Tareas comunes

### Codex remoto / cloud

- Leer tambien `docs/codex-cloud-setup.md` antes de arrancar tareas delegadas en la nube.
- Setup recomendado del entorno remoto: `bash scripts/codex-cloud-setup.sh`.
- Verificacion completa antes de abrir PR: `bash scripts/codex-cloud-verify.sh`.
- Para cambios visuales, arrancar el servidor de desarrollo correspondiente y verificar en navegador real la vista desktop y mobile.
- Pedir acceso externo solo cuando la tarea lo justifique: GitHub para PRs/checks, Cloudflare para Worker/deploy/logs, Linear para contexto de issues, Supabase/Vercel solo si la tarea toca esos sistemas.
- No asumir que las skills locales del usuario existen en Codex cloud; las instrucciones persistentes del repo deben vivir en `AGENTS.md` y `docs/codex-cloud-setup.md`.

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

### Escribir o actualizar posts

Los posts viven en `src/content/posts/*.md`. El detalle renderiza el Markdown y, si hay metadatos de directorio, un cierre quieto (`PostEndMatter`) que conecta serie, proyecto y posts relacionados. La pagina de un proyecto lista automaticamente los posts con `project: <slug>` bajo **Build notes**.

Checklist al añadir un post:

1. Crear `src/content/posts/<slug>.md` con frontmatter valido (schema en `src/content.config.ts`).
2. Contenido en ingles, tono editorial del sitio. Preferir `h2`/`h3` en piezas largas para escaneo.
3. Rellenar conexiones de directorio cuando apliquen (ver abajo). No inventar series/proyectos: reutilizar ids existentes o registrarlos primero.
4. Si el post pertenece a una serie nueva, añadirla en `src/data/post-series.ts` antes de usarla.
5. Si enlaza un proyecto, el `project` debe coincidir con un `slug` de `src/data/projects.ts`.
6. `related` usa ids de post (nombre del archivo sin `.md`), no URLs.
7. Verificar en navegador el detalle del post y, si hay `project`, la seccion Build notes en `/projects/<slug>/`.

Frontmatter de directorio:

| Campo | Uso |
| --- | --- |
| `series` | Id de serie en `src/data/post-series.ts` (ej. `video-digest`). |
| `seriesOrder` | Orden 1-based dentro de la serie. Obligatorio si hay `series`. |
| `project` | Slug del proyecto relacionado. Activa el bloque Project al final del post y Build notes en la ficha del proyecto. |
| `related` | Lista de otros post ids para el bloque "Also in the directory". No hace falta listar aqui los hermanos de serie: eso lo resuelve `series`/`seriesOrder`. |
| `featured` | Marca editorial; hoy no cambia el layout por si sola. |
| `kind` | `article` o `note`. |
| `draft: true` | Excluye el post de build/listados. |

Ejemplo minimo con conexiones:

```yaml
---
title: "Example build note"
description: "Short description for listings and SEO."
date: 2026-08-15
kind: "article"
lang: "en"
tags: ["process"]
featured: false
draft: false
series: "video-digest"
seriesOrder: 3
project: "video-digest"
related: ["why-this-site-is-a-directory"]
---
```

Archivos clave:

- `src/content.config.ts` — schema Zod.
- `src/data/post-series.ts` — catalogo de series.
- `src/lib/post-relations.ts` — resolucion de serie/proyecto/related.
- `src/components/PostEndMatter.astro` — UI del cierre.
- `src/pages/posts/[slug].astro` y `src/pages/projects/[slug].astro` — wiring.

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
