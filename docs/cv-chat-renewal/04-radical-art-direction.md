# Radical Art Direction for cv-chat

## Purpose

This document captures the new design direction for the radical redesign of `cv-chat`.

The previous plans contain useful ideas about content, AI fluency, experience, and the profile agent. This document reframes those ideas as a stronger visual and experiential direction.

The goal is not to incrementally improve the current dark CV. The goal is to redesign `cv-chat` as a more memorable, elegant, technical/editorial experience.

## One-line direction

`cv-chat` should feel like an elegant technical dossier: editorial, asymmetric, slightly experimental, powered by a conversational agent, with restrained GSAP motion and ASCII-inspired interface details.

## What the page is

A professional CV experience with an AI chat/agent layer.

Not the main personal directory. The main site at `miguelgarglez.com` already acts as the broader index for projects, inspiration, and links.

`cv-chat` should have a narrower and stronger purpose:

> A professional profile designed to be explored like an interactive technical dossier, with an AI assistant as part of the interface.

## What the page should feel like

- Modern.
- Elegant.
- Memorable.
- Technical.
- Editorial.
- Slightly artistic.
- Premium but not corporate.
- Experimental but not confusing.
- Clearly built by a technical profile, not a designer portfolio pretending to be art.

## What to avoid

- Generic dark-mode developer portfolio.
- Plain CV cards stacked vertically.
- SaaS dashboard aesthetic.
- Hacker/cyberpunk cliché.
- Excessive neon.
- Over-designed agency portfolio feeling.
- Heavy 3D or motion just for decoration.
- Making the chat the only visual idea.

## Core tension

The desired aesthetic lives between:

```text
technical credibility
        ×
editorial / artistic direction
```

The page should have style, but it should never feel disconnected from Miguel's actual profile as a software engineer.

## Design references to keep in mind

The desired quality level is closer to curated Awwwards-style Astro sites than to a conventional CV page.

Use this inspiration carefully:

- strong first screen;
- art direction;
- asymmetric layout;
- guided scroll;
- parallax;
- typography with character;
- motion as part of the story;
- memorable transitions.

But the final result should remain credible for a technical professional.

## Proposed concept names

Any of these can guide the design language:

### 1. Editorial Technical Dossier

The strongest recommended direction.

A professional file/case/dossier with refined typography, technical labels, restrained motion, and a conversational agent layer.

### 2. AI Case File

The page as a professional case file that the visitor scrolls through. The chat acts like an analyst that can explain the contents.

### 3. Personal AI Workbench

A more product/interface-oriented version. The page feels like a custom tool for exploring Miguel's profile.

### 4. Agentic CV Interface

A more technical framing. Useful for copy, but potentially less elegant as the main aesthetic label.

Recommended blend:

```text
Editorial Technical Dossier + AI Case File
```

## Palette exploration

The current amber/dark palette works but feels too close to common developer portfolios.

Explore a more distinctive palette.

### Option A: Charcoal / Warm Paper / Rust

Most recommended.

```text
background: charcoal / near black
surface: deep warm gray
text: warm paper / off-white
accent: rust / copper / muted amber
secondary: desaturated olive or gray-blue
```

Why it fits:

- Elegant.
- Editorial.
- Warm without being playful.
- Keeps some continuity with the current amber accent but feels more premium.

### Option B: Ink / Bone / Signal Green

More technical.

```text
background: ink black
surface: dark slate
text: bone / off-white
accent: restrained signal green
secondary: gray-blue
```

Why it fits:

- Strong technical identity.
- Works well with ASCII and terminal-inspired details.
- Risk: can become hacker cliché if overused.

### Option C: Deep Navy / Silver / Electric Blue

More product/tech.

```text
background: deep navy
surface: blue-black
text: silver / light gray
accent: electric blue
secondary: muted violet or cyan
```

Why it fits:

- Modern tech/product feel.
- Clean and premium.
- Risk: could become too SaaS-like.

## Typography direction

Use a strong pairing:

```text
editorial sans or display face for big headings
monospace for labels, metadata, prompts, ASCII, and agent UI
legible sans for body copy
```

Desired typography feeling:

- Large editorial hero type.
- Mono labels like `/PROFILE_AGENT`, `/CURRENT_ROLE`, `/EXPERIENCE_ARCHIVE`.
- Body text calm and readable.
- High contrast between headings and metadata.

The typography should do a lot of the visual work.

## Layout direction

Move away from centered stacked CV sections.

Use:

- Asymmetric hero.
- Top navbar.
- Large first screen.
- Strong section transitions.
- Editorial grids.
- Split layouts.
- Sticky/pinned moments.
- Scroll-directed storytelling.

Possible hero structure:

```text
TOP NAV
Miguel García     About / Experience / Agent / Skills / Contact     Ask CV

LEFT
Software engineer building frontend platforms,
design systems and AI-assisted workflows.

RIGHT
ASCII / profile-agent panel / animated technical fragment

BOTTOM
Madrid · Frontend Platform · Design Systems · AI Workflows
↓ Start the visit
```

## Navbar direction

Replace central hero links/buttons with a proper top navbar.

Navbar should include:

- Miguel García or `mg/` as identity.
- Section links.
- A prominent but elegant `Ask CV` action.
- Possibly small status text like `agent: ready`.

The navbar can be sticky or become sticky after the hero.

## Loading / intro direction

Consider a short boot/loading intro, maximum 1–1.5 seconds.

It should feel like a technical/editorial prelude, not a gimmick.

Possible copy:

```text
initializing profile dossier...
indexing work signals...
loading agent context...
ready
```

ASCII-style version:

```text
[cv-chat]
> loading profile dossier
> indexing facts / projects / memories
> agent ready
```

Requirements:

- Must be fast.
- Must not block usability for long.
- Respect reduced motion preferences.
- Avoid becoming annoying on repeat visits if possible.

## Hero direction

The hero should be the biggest change.

Goals:

- More impact.
- More asymmetry.
- More editorial character.
- Stronger connection to the chat/agent concept.
- Less generic developer-portfolio feeling.

Suggested elements:

- Big heading.
- Technical metadata labels.
- Agent preview panel.
- Prompt chips.
- Top navbar.
- Start-the-visit arrow.
- Subtle parallax/ASCII background.

Potential hero copy:

```text
Miguel García
Software engineer building frontend platforms, design systems and AI-assisted workflows.

Explore this professional dossier with an AI assistant trained on my profile, projects and work signals.
```

Alternative more editorial:

```text
A technical profile, made conversational.

Explore my work, engineering judgment and AI-assisted workflow through an interactive CV agent.
```

## ASCII / technical illustration direction

ASCII should be used as a refined visual language, not a retro joke.

Use it for:

- Agent panels.
- Loading states.
- Section dividers.
- Background texture.
- Flow diagrams.
- Small technical illustrations.

Examples:

```text
╭────────────────────╮
│ profile.agent      │
│ facts: indexed     │
│ projects: ready    │
│ status: listening  │
╰────────────────────╯
```

```text
question → intent → context → answer
```

```text
[experience.archive]
  current_role -> ui_platform
  signals      -> design_systems | ai_workflows | product_quality
```

## Motion direction with GSAP

Use GSAP to support the narrative, not to decorate randomly.

Recommended uses:

- Hero intro reveal.
- Text line reveals.
- Parallax metadata and ASCII layers.
- ScrollTrigger section reveals.
- Pinned or sticky experience section.
- Agent panel state changes by section.
- Smooth transitions between content blocks.

Avoid:

- Constant motion.
- Motion that fights reading.
- Excessive scrub animations.
- Heavy page transitions.
- Animations that break mobile usability.

Respect `prefers-reduced-motion`.

## Scroll direction

The page should feel more guided.

Add a clear start cue in the hero:

```text
Start the visit ↓
```

Potential scroll structure:

```text
Intro / boot
↓
Hero
↓
About as positioning
↓
Work signals
↓
Experience dossier
↓
How the agent works
↓
Skills / credentials
↓
Contact
```

Use parallax and pinning selectively.

## Chat direction

The chat remains essential, but it should not be the only design idea.

The chat should feel more integrated through:

- Navbar `Ask CV` action.
- Hero prompt chips.
- Section-level prompts.
- Agent status indicators.
- Visual labels like `context: experience`.
- Improved chat panel styling aligned with the new art direction.

The chat should feel like a layer of the page, not a generic widget.

## Implementation attitude

Do not implement everything at once.

The right approach is:

1. Establish design system and art direction.
2. Redesign hero/navigation/intro.
3. Redesign the main scroll experience.
4. Integrate chat more deeply.
5. Polish motion and responsive behavior.

Each step should be reviewable.

## Success criteria

The redesign succeeds if:

- The first screen feels radically better and more memorable.
- The page looks modern and elegant.
- The page still reads as a technical professional profile.
- The chat feels integrated into the concept.
- The motion adds direction and quality.
- The site no longer feels like a generic CV template.
- The page complements the main `miguelgarglez.com` directory instead of duplicating its role.
