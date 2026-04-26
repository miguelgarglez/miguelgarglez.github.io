# Codex Plan: Scroll Experience Dossier

## Scope

This plan covers the main scroll-driven professional experience redesign.

Focus on:

1. Directed scroll after the hero.
2. Work Signals section.
3. Experience as an editorial/technical dossier.
4. Optional GSAP ScrollTrigger enhancements.
5. Section-level prompt chips.

Read first:

- `docs/cv-chat-renewal/04-radical-art-direction.md`
- `docs/cv-chat-renewal/05-design-system-foundation-codex-plan.md`
- `docs/cv-chat-renewal/06-hero-navbar-intro-codex-plan.md`

## Goal

Make the core CV content feel like a guided, premium, technical/editorial experience instead of a traditional resume timeline.

The section should preserve professional clarity while adding visual rhythm, hierarchy, and scroll direction.

## Desired feeling

The visitor should feel like they are moving through a professional dossier:

```text
signals → current role → previous experience → interpretation
```

Not just reading stacked cards.

## Content structure

Recommended structure:

```text
Work Signals
↓
Experience Dossier
↓
Current Role Focus
↓
Previous Experience Compact Archive
```

This can all live inside one `Experience` section, or be split if the codebase benefits from it.

## Work Signals

Add a strong interpretive block before the role details.

Suggested title:

```text
Work Signals
```

Suggested intro:

```text
The patterns that best describe how I work across frontend platforms, design systems, product quality and AI-assisted delivery.
```

Suggested cards:

```text
Design systems at scale
Reusable UI infrastructure, documentation, accessibility practices and release workflows for frontend teams.

AI-assisted engineering
Using AI tools, MCP/context workflows and structured prompts to speed up implementation without losing code ownership.

Product-minded delivery
Balancing technical quality, maintainability, team adoption and user/business value.

Cross-team collaboration
Supporting developers through components, documentation, conventions and practical implementation guidance.
```

Visual style:

- small mono labels like `signal 01`;
- asymmetric grid;
- compact but premium cards;
- avoid heavy orange borders;
- use metadata and editorial spacing.

## Experience Dossier

Replace the standard timeline feeling with a more designed role presentation.

Suggested current role content:

```text
Current role
Frontend UI Platform Engineer
Open Digital Services · Santander Group
Sep 2024 — Present

Building and maintaining UI components for frontend teams across Grupo Santander.

Signals
Design systems · Accessibility · Storybook · Release workflows · Semantic versioning · AI-assisted development

AI angle
Using Copilot, MCP servers and context engineering to improve implementation speed, code quality and collaborative development.
```

Suggested previous QA role framing:

```text
QA Software Engineer
Sep 2023 — Jul 2024

Worked close to product quality, validation and delivery, strengthening attention to detail, reliability and user-facing impact.

Signals
Quality mindset · Testing · Product validation · Cross-functional collaboration
```

Keep factual accuracy. Do not invent metrics, company details, or responsibilities.

## Layout options

### Option A: Sticky dossier panel

Best for premium scroll experience.

Desktop:

```text
LEFT sticky panel
/EXPERIENCE_DOSSIER
Current section title
Agent/context metadata

RIGHT scroll content
Work signals
Current role
Previous roles
```

This gives direction without being too complex.

### Option B: Pinned current role sequence

More ambitious.

Use GSAP ScrollTrigger to pin the section while content changes:

```text
Panel stays fixed
signals / role / AI angle animate in sequence
```

Only implement if it remains robust and readable.

### Option C: Stacked editorial cards

Safest.

Use strong typography, asymmetric cards and light scroll reveals without pinning.

Recommended first implementation if time is limited.

## GSAP ScrollTrigger suggestions

Use GSAP only if already available and easy to initialize safely.

Suggested effects:

- section titles reveal on enter;
- signal cards stagger in;
- role cards rise/fade in;
- metadata/parallax elements move subtly;
- sticky panel text changes based on active section, only if simple.

Avoid:

- complicated scrub timelines;
- horizontal scroll unless really justified;
- animations that make text hard to read;
- pinning that breaks mobile.

Disable or simplify for mobile and reduced motion.

## Section-level prompts

Add prompt chips connected to the chat concept.

Suggested Work Signals prompts:

```text
Summarize Miguel's work style
What makes Miguel a strong frontend platform engineer?
How does Miguel use AI in engineering?
```

Suggested role prompts:

```text
What has Miguel built at Santander?
Explain Miguel's design system experience
Summarize Miguel's QA background
```

Minimum:

- Render prompt chips with `data-chat-prompt` attributes.

Best:

- Click opens/sends/pre-fills chat.

## Implementation steps

### Step 1: Inspect current Experience section

Find the current component/content source.

Preserve factual content, but change structure and presentation.

### Step 2: Add Work Signals

Implement a compact, visually strong Work Signals block.

### Step 3: Rework role cards

Convert current role and previous roles into dossier-style cards.

Use:

- role metadata;
- mission sentence;
- signal tags;
- optional AI angle;
- contextual prompt chips.

### Step 4: Add directed scroll treatment

Start simple:

- strong section layout;
- sticky side label on desktop if easy;
- reveal animations.

Only add pinning after the layout is stable.

### Step 5: Responsive pass

On mobile:

- no complex pinning;
- stack content cleanly;
- keep labels readable;
- avoid tiny metadata.

### Step 6: Validation

Run:

```bash
npm run build
```

If backend profile knowledge is changed, run:

```bash
npm run test:profile-agent
```

## Acceptance criteria

- Experience no longer feels like a generic CV timeline.
- Work value is clear through signals before details.
- Current role is easier to understand.
- AI-assisted engineering is visible but grounded.
- Scroll feels more directed and premium.
- Mobile remains readable and stable.
- Build passes.

## Suggested commits

```text
feat(cv-chat): add work signals section
refactor(cv-chat): redesign experience as dossier cards
style(cv-chat): add scroll reveals for experience dossier
```
