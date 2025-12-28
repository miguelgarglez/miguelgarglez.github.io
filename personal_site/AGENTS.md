# AGENTS.md

Contexto del repo: sitio personal en Astro con animaciones GSAP y toggle de tema (clase `body.light`). La home es una sola pagina con secciones Hero, About, Experience, Education, Skills y Contact.

## Estructura clave

- `src/pages/index.astro`: entrypoint, monta `Layout` + `Welcome`.
- `src/layouts/Layout.astro`: HTML base, fuentes Google, CSS variables y tema; incluye `ThemeToggle`.
- `src/components/ThemeToggle.astro`: boton de cambio de tema (solo alterna `body.light`).
- `src/components/welcome/*`: secciones del perfil y sus animaciones GSAP.
- `src/layouts/Footer.astro`: pie con datos de contacto.
- `astro.config.mjs`: `base: '/personal_site'` y configuracion de `astro-icon`.

## Contenido y edicion de secciones

- `Hero.astro`: nombre, titulo, ciudad y contactos. Los CTA enlazan a `#about` y `#contact`.
- `About.astro`: resumen profesional y cualidades personales.
- `Experience.astro`: timeline laboral con logros y comportamiento expandible en movil.
- `Education.astro`: estudios y exchange.
- `Skills.astro`: categorias tecnicas y cita de filosofia.
- `Contact.astro`: metodos de contacto y hobbies.
- `Footer.astro`: repite nombre y links de contacto.

Si cambias email, telefono o LinkedIn, actualiza en `Hero.astro`, `Contact.astro` y `Footer.astro` para mantener consistencia.

## Animaciones (GSAP)

- Cada seccion importa `gsap` y `ScrollTrigger` (cuando aplica), con `gsap.registerPlugin(ScrollTrigger)`.
- Mantener el mismo patron: `gsap.set` inicial y `gsap.to` con `scrollTrigger`.
- Evitar animar elementos inexistentes o cambiar clases/IDs sin actualizar los selectores GSAP.

## Estilos y tema

- Las variables de color y fuentes viven en `src/layouts/Layout.astro` dentro de `:root` y `body.light`.
- El fondo principal y tipografia base se definen en el `body` de `Layout.astro`.
- Usa las clases utilitarias ya presentes (`.page-shell`, `.section`, `.section-title`, `.card`) para mantener consistencia.

## Responsiveness (obligatorio)

- La pagina debe ser compatible con mobile en todos los casos.
- Cualquier cambio de layout, tipografia o espaciado debe revisarse en breakpoints moviles.
- Mantener o extender los `@media` existentes en cada seccion para que no haya overflow horizontal ni elementos cortados.

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
