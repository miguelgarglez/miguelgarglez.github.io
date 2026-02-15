# AGENTS.md

Contexto del repo: sitio personal en Astro con animaciones GSAP, toggle de tema (clase `body.light`) y una sección de chat en la home basada en AI Elements del AI SDK. La home es una sola pagina con secciones Hero, About, Experience, Education, Skills, Chat y Contact.

## Estructura clave

- `src/pages/index.astro`: entrypoint, monta `Layout` + `Welcome`.
- `src/layouts/Layout.astro`: HTML base, fuentes Google, CSS variables y tema; incluye `ThemeToggle`.
- `src/components/ThemeToggle.astro`: boton de cambio de tema (solo alterna `body.light`).
- `src/components/welcome/*`: secciones del perfil y sus animaciones GSAP.
- `src/components/chat/ChatLauncher.astro`: wrapper del chat, resuelve endpoints primario/secundario y monta el componente React.
- `src/components/chat/Chat.tsx`: UI y lógica de chat con AI SDK (`useChat` + `DefaultChatTransport`).
- `src/components/ai-elements/*`: componentes derivados de AI Elements (conversación, mensajes, prompt input, loader).
- `src/components/ui/*`: componentes base estilo shadcn usados por AI Elements.
- `src/styles/global.css`: tokens Tailwind + estilos base para utilidades de shadcn.
- `src/layouts/Footer.astro`: pie con datos de contacto.
- `astro.config.mjs`: `base: '/personal_site'` y configuracion de `astro-icon`.

## Contenido y edicion de secciones

- `Hero.astro`: nombre, titulo, ciudad y contactos. Los CTA enlazan a `#about` y `#contact`.
- `About.astro`: resumen profesional y cualidades personales.
- `Experience.astro`: timeline laboral con logros y comportamiento expandible en movil.
- `Education.astro`: estudios y exchange.
- `Skills.astro`: categorias tecnicas y cita de filosofia.
- `ChatSection.astro`: sección de chat con `client:visible` para hidratar el componente React.
- `Contact.astro`: metodos de contacto y hobbies.
- `Footer.astro`: repite nombre y links de contacto.

Si cambias email, telefono o LinkedIn, actualiza en `Hero.astro`, `Contact.astro` y `Footer.astro` para mantener consistencia.

## Animaciones (GSAP)

- Cada seccion importa `gsap` y `ScrollTrigger` (cuando aplica), con `gsap.registerPlugin(ScrollTrigger)`.
- Mantener el mismo patron: `gsap.set` inicial y `gsap.to` con `scrollTrigger`.
- Evitar animar elementos inexistentes o cambiar clases/IDs sin actualizar los selectores GSAP.

## Chat (AI SDK + AI Elements)

- `Chat.tsx` usa `useChat` con `DefaultChatTransport` y el header `x-vercel-ai-ui-message-stream: v1` para streaming.
- El chat admite endpoint primario/secundario para failover transparente.
- La UI del chat es React y se monta en Astro con `client:visible` para evitar hidratar antes de ser visible.
- Los mensajes renderizan markdown via `MessageResponse` (usa `Streamdown`); mantener ese componente si se cambia el formato.

## Variables de entorno

- `PUBLIC_CHAT_API_PRIMARY_URL`: URL del endpoint primario en producción.
- `PUBLIC_CHAT_API_SECONDARY_URL`: URL del endpoint secundario en producción.
- `DEV_PUBLIC_CHAT_API_PRIMARY_URL`: URL del endpoint primario en desarrollo.
- `DEV_PUBLIC_CHAT_API_SECONDARY_URL`: URL del endpoint secundario en desarrollo.
- Compat legacy: `PUBLIC_WORKER_CHAT_URL` y `DEV_PUBLIC_WORKER_CHAT_URL` se usan como fallback si no se define el primario nuevo.
- Si no están definidas, el chat no podrá enviar mensajes (ver `src/components/welcome/ChatSection.astro`).

## UI y estilos (shadcn + Tailwind)

- Los componentes en `src/components/ui` son base shadcn; evitar edits innecesarios fuera de nuevos requerimientos.
- `src/lib/utils.ts` expone `cn` (clsx + tailwind-merge) y se usa en UI/AI Elements.
- `src/styles/global.css` define tokens para Tailwind/`tw-animate-css`; mantener consistencia con las variables de `Layout.astro`.

## Estilos y tema

- Las variables de color y fuentes viven en `src/layouts/Layout.astro` dentro de `:root` y `body.light`.
- El fondo principal y tipografia base se definen en el `body` de `Layout.astro`.
- Usa las clases utilitarias ya presentes (`.page-shell`, `.section`, `.section-title`, `.card`) para mantener consistencia.

## Responsiveness (obligatorio)

- La pagina debe ser compatible con mobile en todos los casos.
- Cualquier cambio de layout, tipografia o espaciado debe revisarse en breakpoints moviles.
- Mantener o extender los `@media` existentes en cada seccion para que no haya overflow horizontal ni elementos cortados.

## Notas de Skills

- En `src/components/welcome/Skills.astro` la altura desktop de las tarjetas usa `--skill-card-height` (valor fijo). Si se añaden muchas skills y se ve clipping, ajustar ese valor.

## Iconos

- Se usa `astro-icon` con `@iconify-json/lucide`.
- En componentes Astro, usar `<Icon name="lucide:icon-name" />`.
- Si agregas un icono nuevo, incluye su nombre en `astro.config.mjs` dentro de `include.lucide`.
- Evitar emojis o SVG inline.

## Rutas y assets

- `base` es `/personal_site`, asi que los assets publicos deben referenciarse con ese prefijo si aplica.
- `favicon` vive en `public/favicon.png` y se referencia como `/personal_site/favicon.png` en `Layout.astro`.

## Idioma

- El contenido actual esta mayormente en ingles. Mantener ingles o bilingue de forma coherente en toda la pagina.

## Scripts

- `npm run dev`, `npm run build`, `npm run preview` (definidos en `personal_site/package.json`).
