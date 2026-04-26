# Codex Plan: Design System Foundation

## Scope

This is the first implementation-oriented plan for the radical redesign of `cv-chat`.

Focus on setting the visual foundation only:

1. Palette exploration and final token setup.
2. Typography direction.
3. Global spacing and surface styles.
4. Basic layout primitives for the new art direction.
5. Reduced-motion safety.

Do not redesign the full page in this phase. Do not heavily rework content sections yet.

Read first:

- `docs/cv-chat-renewal/04-radical-art-direction.md`

## Goal

Create the foundation for a more elegant technical/editorial aesthetic.

The current page should start moving away from a generic dark CV and toward:

> an elegant technical dossier with editorial typography, technical metadata, restrained motion, and ASCII-inspired details.

## Design direction

Recommended palette direction:

```text
Charcoal / Warm Paper / Rust
```

This keeps some warmth from the existing amber accent but makes the page feel more premium and editorial.

Suggested token family:

```text
--color-bg
--color-bg-elevated
--color-surface
--color-surface-soft
--color-text
--color-text-muted
--color-text-subtle
--color-border
--color-border-strong
--color-accent
--color-accent-muted
--color-accent-soft
--color-mono-green or --color-signal, optional
```

Possible palette values to try, adjust visually:

```css
--color-bg: #12100e;
--color-bg-elevated: #191613;
--color-surface: #211d19;
--color-surface-soft: #2b251f;
--color-text: #f2eadf;
--color-text-muted: #b8aa99;
--color-text-subtle: #7f7367;
--color-border: rgba(242, 234, 223, 0.12);
--color-border-strong: rgba(242, 234, 223, 0.22);
--color-accent: #c8753d;
--color-accent-muted: #9f623c;
--color-accent-soft: rgba(200, 117, 61, 0.14);
--color-signal: #9bbf9a;
```

These are suggestions, not strict requirements.

## Typography direction

Create a stronger hierarchy.

Desired pairing:

```text
Display/editorial sans for large headings
Clean sans for body
Monospace for labels, metadata, prompts, agent UI, ASCII
```

If the project currently uses system fonts, it is acceptable to keep system fonts in this phase but define clear CSS variables:

```css
--font-display
--font-body
--font-mono
```

Suggested safe stack:

```css
--font-display: Inter, ui-sans-serif, system-ui, sans-serif;
--font-body: Inter, ui-sans-serif, system-ui, sans-serif;
--font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
```

If adding hosted web fonts, do so carefully and avoid hurting performance. Do not add a heavy font strategy unless explicitly needed.

## Global style goals

Update the visual language around:

- body background;
- section spacing;
- cards/panels;
- borders;
- metadata labels;
- buttons;
- prompt chips;
- links;
- focus states.

Create reusable classes or component patterns if the codebase already supports them.

Recommended primitives:

```text
.section-shell
.section-kicker
.section-title
.section-copy
.dossier-panel
.metadata-label
.prompt-chip
.ascii-panel
```

Do not over-abstract if the current project is simple.

## Surface style direction

Panels should feel like editorial/interface modules, not generic cards.

Suggested traits:

- subtle border;
- warm dark surface;
- controlled radius;
- low-opacity accent glows only where useful;
- mono labels;
- less heavy orange borders;
- more typographic contrast.

Avoid:

- too many identical cards;
- excessive glassmorphism;
- bright neon;
- noisy backgrounds that hurt readability.

## Background direction

Add subtle depth to the page background.

Possible approach:

```css
body::before or page wrapper background:
- radial gradient near hero;
- subtle noise if existing asset or CSS method is already available;
- low-opacity grid or ASCII texture later, not necessarily in this phase.
```

Keep it restrained.

## Reduced motion foundation

Add or verify reduced-motion handling:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

If GSAP is used later, make sure animation setup checks `prefers-reduced-motion` before initializing heavy scroll animations.

## Implementation steps

### Step 1: Locate current global styles

Find where `cv-chat` defines:

- global CSS;
- page-specific CSS;
- theme variables;
- light/dark theme support, if any;
- shared button/card classes.

### Step 2: Add design tokens

Add the new palette variables in the appropriate global/root scope.

If the site has light/dark support, either:

- update the dark theme first and keep light theme functional;
- or define the new aesthetic as the default for `cv-chat` only.

Do not accidentally break the main directory/home page if styles are shared globally.

### Step 3: Update base typography

Define display/body/mono font variables and apply them consistently.

Introduce larger, more editorial heading styles where safe.

### Step 4: Create reusable visual primitives

Add small utility classes or component styles for:

- metadata labels;
- dossier panels;
- prompt chips;
- ASCII/agent panels.

These will be used in later phases.

### Step 5: Do a minimal visual pass on existing page

Apply only enough to verify the new foundation works.

Do not fully redesign hero/experience here unless this phase is combined with the next plan.

### Step 6: Build and verify

Run:

```bash
npm run build
```

## Acceptance criteria

- The new palette tokens exist and are used by the `cv-chat` page.
- The visual tone feels warmer, more editorial, and less generic.
- Typography hierarchy is stronger or ready to become stronger.
- Reusable primitives exist for later sections.
- Existing chat behavior is not broken.
- The main `miguelgarglez.com` directory is not unintentionally restyled unless intended.
- Build passes.

## Suggested commits

```text
style(cv-chat): add radical redesign color tokens
style(cv-chat): add editorial typography primitives
style(cv-chat): add dossier panel and prompt chip primitives
```
