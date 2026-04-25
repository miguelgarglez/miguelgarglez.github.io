# Codex Plan: Hero and Experience Renewal

## Scope

This document defines the first implementation phase for the `cv-chat` renewal.

Focus only on:

1. Improving the Hero section.
2. Reworking the Experience section.

Do not redesign the full page in this phase. Keep the rest of the site stable unless small supporting changes are necessary.

## Product goal

Turn the first impression and professional experience area from a traditional CV layout into a stronger conversational portfolio experience.

The page should immediately communicate:

- Miguel is a product-minded software engineer.
- His strongest current positioning is frontend platforms, design systems, and practical AI-assisted workflows.
- The chat is a core part of the experience, not a floating add-on.
- His work experience should be understood through clear professional signals, not only through resume bullets.

## Important context

The repository already contains a real chat system around `cv-chat`:

- Astro frontend.
- Cloudflare Worker chat backend.
- SSE streaming UI.
- Lightweight profile-agent runtime.
- Deterministic context selection.
- Structured knowledge files for facts, profile blocks, projects, and memories.
- Retrieval regression tests via `npm run test:profile-agent`.

The Hero should make this more visible conceptually, without overexplaining the backend.

The Experience section should connect professional work with the same narrative: engineering value, design systems, frontend platform work, product quality, and AI-assisted delivery.

## Current problems to solve

### Hero

Current issues:

- Clean but generic.
- Looks like a standard software engineer landing page.
- Does not strongly communicate the conversational nature of `cv-chat`.
- The chat button appears detached from the hero narrative.
- The subtitle is good but could be sharper and more differentiated.

### Experience

Current issues:

- Traditional timeline/card layout feels too much like a CV template.
- Long bullet lists make the section informative but not memorable.
- The timeline decoration does not add enough meaning.
- The section does not foreground the most valuable work signals.
- AI-assisted workflows are present but buried as one bullet.

## Desired user impression

After seeing the hero and experience sections, a visitor should think:

> Miguel has a modern engineering profile: frontend platform work, design systems, AI-assisted workflows, and enough product sense to explain his work clearly.

The page should feel like a crafted interface, not an exported resume.

## Hero requirements

### Copy direction

Use a stronger headline/subheadline structure.

Recommended copy:

```text
Miguel García
Software Engineer building frontend platforms, design systems and AI-assisted workflows.

Explore my work through a conversational interface powered by a lightweight profile agent.
```

Alternative if the layout needs a shorter subheadline:

```text
Product-minded software engineer focused on frontend platforms, design systems, and practical AI workflows.
```

Supporting line:

```text
Ask the interface about my work, projects, stack, or how this CV chat works.
```

### Hero interaction

Add prompt chips near the hero that connect directly with the chat experience.

Suggested chips:

```text
What kind of engineer is Miguel?
Show me his AI workflow
What has he built at Santander?
How does this CV chat work?
```

If the existing chat component already supports programmatic opening/sending a message, wire these chips to open the chat with the selected prompt.

If not, implement the chips as UI-only buttons in this phase, but structure the code so they can be connected later. Use clear data attributes or a small helper function for future integration.

Suggested behavior priority:

1. Best: click opens the chat and sends the prompt.
2. Acceptable: click opens the chat and pre-fills the prompt.
3. Minimum: click visually indicates suggested questions without behavior.

### Hero visual direction

Keep the current dark/amber identity, but make the hero feel more like an interface.

Suggestions:

- Add a small label above the main title, e.g. `Conversational Portfolio` or `Personal AI Workbench`.
- Add a compact mini-panel suggesting that the page is queryable.
- Use prompt chips as part of the composition, not just buttons.
- Keep social/location chips, but make sure they do not overpower the new prompt chips.
- Consider a two-column desktop layout:
  - Left: identity and value proposition.
  - Right: mini chat/agent preview panel.
- On mobile, stack cleanly with title first and prompt chips below.

Possible mini-panel content:

```text
Profile agent
Status: ready
Context: facts · projects · memories
Try asking: “How does Miguel use AI in development?”
```

Do not make it too gimmicky. It should feel premium and restrained.

### Hero CTAs

Current `About Me` and `Get in Touch` buttons can stay, but consider replacing or rebalancing them:

Primary CTA:

```text
Ask the CV
```

Secondary CTA:

```text
View experience
```

Or keep:

```text
About Me
Get in Touch
```

But add prompt chips so the conversational action is prominent.

## Experience requirements

### New section concept

Replace the experience section's emphasis from a pure timeline to:

1. Work Signals.
2. Experience Archive.

This can be within one `Experience` section, but visually split into two parts.

Suggested section title:

```text
Experience
```

Suggested subtitle:

```text
Product-facing engineering roles across frontend platforms, QA, and early-stage software delivery — reframed through the signals that best describe how I work.
```

Or shorter:

```text
Engineering experience shaped by frontend platforms, design systems, product quality, and AI-assisted delivery.
```

### Work Signals block

Add a high-level block before the detailed role cards.

Suggested signal cards:

```text
Design systems at scale
Building reusable UI infrastructure, documentation, accessibility practices, and release workflows for frontend teams.

AI-assisted engineering
Using Copilot, MCP/context workflows, and structured prompts to speed up implementation without losing code ownership.

Product-minded delivery
Balancing technical quality, maintainability, team adoption, and user/business value.
```

Optional fourth signal:

```text
Cross-team collaboration
Supporting developers with components, documentation, conventions, and practical implementation guidance.
```

Visual direction:

- Use compact cards, not huge blocks.
- Add small labels like `signal 01`, `signal 02`, etc.
- Use the amber accent for labels, not for entire heavy borders.
- Keep strong contrast and legible text.

### Experience Archive cards

Replace long CV cards with more structured role cards.

Each role card should have:

- Period.
- Role.
- Company.
- One-line mission.
- Signal tags.
- Optional AI angle if relevant.
- Optional `Ask about this role` prompt button/chip.

Recommended card structure:

```text
Current role
Frontend UI Platform Engineer
Open Digital Services · Santander Group
Sep 2024 — Present

Building and maintaining UI components for frontend teams across Grupo Santander.

Signals
Design systems · Accessibility · Storybook · Release workflows · Semantic versioning · AI-assisted development

AI angle
Using Copilot, MCP servers, and context engineering to improve implementation speed, code quality, and collaborative development.
```

For previous roles, keep the same format but avoid overclaiming.

The previous QA/software experience should not disappear. It can be compacted and reframed as foundation:

```text
QA Software Engineer
Sep 2023 — Jul 2024

Worked close to product quality, validation, and delivery, strengthening attention to detail, reliability, and user-facing impact.

Signals
Quality mindset · Testing · Product validation · Cross-functional collaboration
```

If there are additional early-stage roles, present them compactly with the same pattern.

### Prompt chips in Experience

Add contextual prompts if feasible:

```text
Ask about this role
How did Miguel use AI in this role?
What kind of design system work did he do?
Summarize his frontend platform experience
```

Implementation priority:

1. Wire to chat if there is an existing API/event/helper.
2. Otherwise add the UI with data attributes for later wiring.

Possible data attributes:

```html
<button data-chat-prompt="Summarize Miguel's frontend platform experience">
  Ask about frontend platform work
</button>
```

## Content hierarchy

Hero should establish positioning.

Experience should prove it.

Avoid repeating the same generic phrases too much. For example, do not use `AI-assisted workflows` in every sentence. Use concrete terms:

- Copilot.
- MCP/context workflows.
- Storybook documentation.
- Semantic versioning.
- Accessibility.
- Design system consistency.
- Release management.
- Component APIs.
- Cross-team support.

## Visual hierarchy guidance

### Keep

- Existing dark theme.
- Amber accent.
- Rounded cards.
- Overall polished feeling.
- Existing theme toggle.
- Existing floating chat access.

### Improve

- Reduce centered generic hero feel.
- Introduce more interface-specific elements.
- Make the hero more directly connected to the chat.
- Make experience easier to scan.
- Use tags and signal labels to replace long bullet density.
- Reduce decorative timeline if it does not add meaning.

### Avoid

- Large identical cards for everything.
- Too many orange borders.
- Overloaded animation.
- Rewriting unrelated sections.
- Breaking mobile layout.
- Adding heavy dependencies.
- Making the page look like a generic SaaS dashboard.

## Implementation approach

### Step 1: Inspect current structure

Find the Astro page/component files for `/cv-chat/`.

Likely areas:

- Astro page under `src/pages` or equivalent.
- Components for Hero, Experience, Chat, Skills, Contact.
- Global styles or section-specific CSS.
- Any data files containing experience/education/skills content.

Before changing code, identify whether content is hardcoded or data-driven.

### Step 2: Refactor only if useful

If the Hero and Experience are currently inside one large page file, consider extracting only if it makes the change clearer:

- `HeroSection.astro`
- `ExperienceSection.astro`
- `PromptChip.astro`
- `SignalCard.astro`
- `ExperienceRoleCard.astro`

Do not over-abstract. This is a small site; clarity matters more than premature component architecture.

### Step 3: Implement Hero copy and layout

Minimum implementation:

- Update headline/subheadline.
- Add conversational positioning line.
- Add prompt chips.
- Keep existing social/location chips.
- Keep or rebalance CTAs.

Better implementation:

- Add a right-side mini profile-agent panel on desktop.
- Add prompt chips that open/pre-fill/send chat prompts.
- Add section anchor CTA to Experience.

### Step 4: Implement Experience redesign

- Add Work Signals block.
- Replace timeline-heavy layout with signal-led role cards.
- Preserve factual experience content.
- Compact role descriptions.
- Add tags and optional AI angle.
- Add contextual prompt chips.

### Step 5: Responsive pass

Check:

- Desktop wide layout.
- Tablet.
- Mobile.
- Chat button overlap.
- Prompt chips wrapping.
- Experience cards readability.
- Section spacing.

### Step 6: Validation

Run:

```bash
npm run build
```

If any profile-agent knowledge or retrieval behavior is changed, also run:

```bash
npm run test:profile-agent
```

For this phase, the profile-agent tests may not be necessary unless content used by the backend knowledge files changes.

## Acceptance criteria

### Hero

- The hero no longer feels like a generic developer landing.
- It clearly frames the page as a conversational portfolio.
- It communicates frontend platforms, design systems, and AI-assisted workflows.
- It includes suggested questions/prompts.
- It remains responsive and readable.

### Experience

- The section no longer feels like a standard resume timeline.
- Work value is summarized through clear signals.
- Current role is easier to understand at a glance.
- AI-assisted development is visible but not exaggerated.
- Previous experience is preserved but more compact.
- The section visually matches the rest of the site.

### Technical

- Existing chat functionality remains working.
- No backend behavior is broken.
- No unnecessary dependencies are added.
- Build passes.

## Suggested first commit breakdown

Use small commits:

1. `refactor(cv-chat): prepare hero and experience sections`
2. `feat(cv-chat): add conversational hero prompts`
3. `feat(cv-chat): rework experience around work signals`
4. `style(cv-chat): polish responsive hero and experience layouts`

If implementing in one Codex session, still keep the patch conceptually organized by these phases.

## Copy bank

### Hero options

Option A:

```text
Software Engineer building frontend platforms, design systems and AI-assisted workflows.

Explore my work through a conversational interface powered by a lightweight profile agent.
```

Option B:

```text
Product-minded software engineer focused on frontend platforms, design systems, and practical AI workflows.

Ask the interface about my work, projects, stack, or how this CV chat works.
```

Option C:

```text
I build frontend platforms, design systems, and AI-assisted workflows for teams that care about quality, speed, and product impact.
```

### Prompt chips

```text
What kind of engineer is Miguel?
Show me his AI workflow
What has he built at Santander?
How does this CV chat work?
Summarize his frontend platform experience
```

### Work signals

```text
Design systems at scale
Building reusable UI infrastructure, documentation, accessibility practices, and release workflows for frontend teams.

AI-assisted engineering
Using Copilot, MCP/context workflows, and structured prompts to speed up implementation without losing code ownership.

Product-minded delivery
Balancing technical quality, maintainability, team adoption, and user/business value.

Cross-team collaboration
Supporting developers through components, documentation, conventions, and practical implementation guidance.
```

### Current role card

```text
Current role
Frontend UI Platform Engineer
Open Digital Services · Santander Group
Sep 2024 — Present

Building and maintaining UI components for frontend teams across Grupo Santander.

Signals
Design systems · Accessibility · Storybook · Release workflows · Semantic versioning · AI-assisted development

AI angle
Using Copilot, MCP servers, and context engineering to improve implementation speed, code quality, and collaborative development.
```
