# AGENTS.md

Contexto del repo: sitio estático en `index.html` que actúa como directorio de proyectos. Hoy solo enlaza a `personal_site`, que es un sitio Astro con mi perfil profesional y CV, con animaciones GSAP.

## Estructura

- `index.html`: pagina de entrada/directorio de proyectos.
- `personal_site/`: sitio Astro.
- `.github/workflows/deploy.yml`: workflow de deploy (si aplica).

## Tareas comunes

### Trabajar en `index.html`

- Añadir nuevas entradas de proyectos con enlaces claros.
- Mantener el estilo simple y directo, tipo directorio.
- Revisar que los links apunten a rutas reales dentro del repo o a URLs validas.

### Trabajar en `personal_site/`

- Seguir el stack actual (Astro + GSAP).
- Usar los scripts definidos en `personal_site/package.json`:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
- Mantener el contenido en inglés.
- Respetar el estilo visual actual y las animaciones con scroll.

## Notas para agentes

- Antes de cambios, revisar `personal_site/README.md` para contexto del sitio si existe.
- Si se agregan nuevos proyectos al directorio, considerar actualizar README del repo si es necesario.
- Iconos: se usa `astro-icon` con el set `@iconify-json/lucide`. La configuración está en `personal_site/astro.config.mjs` (lista `include`). En componentes Astro, usar `<Icon name="lucide:icon-name" />` y evitar emojis/SVG inline.
- La fuente canónica del perfil es el contenido visible de `personal_site`. `chat-worker/src/profile-data.ts` debe estar alineado con esa información, y puede incluir contenido complementario no visible en la web.
