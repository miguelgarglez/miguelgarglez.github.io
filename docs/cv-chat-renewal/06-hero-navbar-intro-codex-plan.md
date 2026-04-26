# Codex Plan: Hero, Navbar and Intro

## Scope

This plan implements the first visible radical redesign phase.

Focus on:

1. Top navbar.
2. Optional short loading/boot intro.
3. Asymmetric hero.
4. Start-the-visit scroll cue.
5. Hero-level agent access cues.
6. Initial GSAP reveal motion.

Read first:

- `docs/cv-chat-renewal/04-radical-art-direction.md`
- `docs/cv-chat-renewal/05-design-system-foundation-codex-plan.md`

## Goal

Make the first screen feel radically more memorable and premium.

The visitor should immediately understand:

- This is a professional CV experience.
- It is conversational and AI-assisted.
- It has a strong technical/editorial identity.
- It is not a generic developer portfolio.

## Desired first impression

> A technical profile, made conversational.

or

> An elegant professional dossier with an AI assistant built into the interface.

Current direction: keep the hero extremely simple and let the identity do the work.

## Navbar requirements

Replace the current middle-of-hero link/button emphasis with a proper top navigation.

Suggested navbar items:

```text
Miguel García / mg
About
Experience
Agent
Skills
Contact
Ask CV
```

Requirements:

- Navbar should be visible on first load.
- It may be sticky or fixed.
- It should feel light and editorial, not like a SaaS app header.
- `Ask CV` should be visually distinct but not loud.
- On mobile, collapse gracefully or use a compact layout.

Possible navbar metadata:

```text
agent: ready
```

Confirmed identity: `/miguelgarglez`.

Only include if it improves the design.

## Optional loading / boot intro

Add a short intro only if it can be implemented cleanly.

Maximum duration: 1–1.5 seconds.

Suggested copy:

```text
[cv-chat]
> loading profile dossier
> indexing facts / projects / memories
> agent ready
```

Requirements:

- Respect `prefers-reduced-motion`.
- Avoid long delays.
- Avoid blocking repeat visits if a simple session flag is easy to add.
- Keep it elegant and minimal.

If implementation feels heavy, skip the intro and focus on the hero reveal.

Decision: skip the intro.

## Hero layout

Move toward an asymmetric editorial layout.

Suggested desktop structure:

```text
TOP NAV
Miguel García     About / Experience / Agent / Skills / Contact     Ask CV

MAIN
Miguel García
minimal supporting line
light metadata
scroll cue

BOTTOM
Madrid · Frontend Platform · Design Systems · AI Workflows
Start the visit ↓
```

Update: keep the composition even simpler. The hero should primarily be name-first, with minimal supporting copy and only the scroll cue visible by default.
The agent should be accessible from the navbar and drawer, not as a fixed visible panel.

Suggested mobile structure:

```text
Navbar
Name
Minimal supporting line
Metadata
Start the visit
```

## Hero copy options

Primary recommendation:

```text
Software engineer building frontend platforms, design systems and AI-assisted workflows.

Explore this professional dossier with an AI assistant trained on my profile, projects and work signals.
```

Alternative more editorial:

```text
A technical profile, made conversational.

Explore my work, engineering judgment and AI-assisted workflow through an interactive CV agent.
```

Alternative more direct:

```text
Product-minded software engineer focused on frontend platforms, design systems and practical AI workflows.

Ask the CV about my experience, projects, stack or how this agent works.
```

Decision: do not lock the exact supporting line yet; keep it open for refinement.

## Hero agent access

Do not create a fixed right-side panel in the hero for now.

The agent should live in the drawer and remain reachable from the navbar and shortcut.

Possible drawer content:

```text
╭──────────────────────────╮
│ profile.agent            │
│ status: ready            │
│ context: facts/projects  │
│ mode: professional cv    │
╰──────────────────────────╯
```

Or a more UI-like panel:

```text
/profile.agent
status       ready
knowledge    facts · projects · memories
response     streaming enabled
```

Add prompt chips:

```text
What kind of engineer is Miguel?
Show me his AI workflow
What has he built at Santander?
How does this CV chat work?
```

If chat integration exists, wire chips to open/send/pre-fill the chat from the drawer.

Minimum: render visual prompt chips with `data-chat-prompt` attributes in the drawer or later sections.

## Start-the-visit cue

Add a clear scroll cue.

Possible copy:

```text
Start the visit ↓
```

or

```text
Scroll to enter ↓
```

It should scroll to the next section, likely About or Work Signals.

Decision: the scroll cue is enough; no extra CTA needed in the hero.

Implementation:

- Use anchor link if simple.
- Smooth scroll only if already safe and compatible.
- Respect reduced motion.

## GSAP motion

Use GSAP for a restrained hero reveal.

Suggested animation sequence:

1. Navbar fades/slides in.
2. Name appears.
3. Supporting line fades in.
4. Metadata settles in.
5. ASCII fragment appears subtly.
6. Start cue appears last.

Use `gsap.context()` or equivalent cleanup if this is inside an Astro island/client script.

Respect `prefers-reduced-motion`:

- If reduced motion is enabled, show content immediately.
- Avoid scrub animations in this phase.

Decision: keep motion very restrained and premium.

## Visual details

Use the design system primitives from phase 05:

- metadata labels;
- dossier panels;
- prompt chips;
- mono typography;
- warm charcoal/paper/rust palette.

Potential background elements:

- subtle radial gradient;
- very low-opacity grid;
- ASCII fragment layer;
- parallax reserved for later phases unless easy.

Decision: place a subtle ASCII fragment in the hero background, with a soft entrance and minimal drift.

Avoid:

- huge center-aligned social button cluster;
- generic pill overload;
- excessive orange glow;
- heavy terminal cliché.

## Implementation steps

### Step 1: Inspect existing hero and chat trigger

Find:

- hero markup/component;
- existing buttons/links;
- chat open logic;
- any global nav if present.

### Step 2: Add navbar

Implement or refactor a top navbar for `cv-chat`.

Make sure it does not unintentionally affect the main directory page unless shared intentionally.

Implementation note: show the nav in the hero and let it become sticky after scroll.

### Step 3: Add hero layout

Build the asymmetric hero with:

- kicker;
- headline;
- body;
- agent panel;
- prompt chips;
- metadata;
- scroll cue.

### Step 4: Wire prompt chips if feasible

If chat trigger is easy to access, wire chips.

Otherwise add stable `data-chat-prompt` attributes for later.

Implementation note: the drawer opens on click, with `Cmd+K` / `Ctrl+K` as a secondary shortcut.

### Step 5: Add GSAP reveal

Add a small hero animation script.

Keep it isolated and safe.

### Step 6: Responsive pass

Check:

- desktop composition;
- tablet;
- mobile;
- navbar wrapping;
- hero height;
- agent panel readability;
- prompt chips wrapping;
- chat button overlap.

### Step 7: Validation

Run:

```bash
npm run build
```

## Acceptance criteria

- First screen feels significantly more distinctive.
- Navbar replaces the old centered link/button feel.
- Hero is asymmetric and editorial/technical.
- Chat/agent concept is accessible immediately.
- Start-the-visit cue exists and works.
- Motion is restrained and respects reduced motion.
- Existing chat backend remains untouched.
- Build passes.

## Suggested commits

```text
feat(cv-chat): add editorial navbar
feat(cv-chat): redesign hero as technical dossier
feat(cv-chat): add hero agent access cues
style(cv-chat): add restrained GSAP hero reveal
```
