# cv-chat Renewal Vision

## Purpose

This document captures the global direction for the renewal of `cv-chat`, Miguel García's conversational portfolio at `/cv-chat/`.

The goal is not to make a prettier CV. The goal is to turn the page into a memorable professional interface: a place where visitors can explore Miguel's profile, work, engineering judgment, projects, and AI-assisted workflow through a polished visual experience and a real conversational system.

`cv-chat` should feel like a living professional profile, not a static resume with a chat button attached.

## Core idea

`cv-chat` should become a conversational portfolio powered by a lightweight profile agent.

The page should communicate three things at once:

1. Miguel is a product-minded software engineer focused on frontend platforms, design systems, maintainability, and practical AI workflows.
2. Miguel understands modern AI-assisted engineering beyond shallow tool usage.
3. The page itself is proof: it combines Astro, a streaming chat interface, a Cloudflare Worker backend, deterministic profile-agent context selection, curated knowledge files, and retrieval tests.

The strongest positioning is:

> A conversational portfolio for exploring how Miguel builds, thinks, and works with AI.

Alternative phrasing:

> A personal AI workbench for exploring Miguel's work, projects, and engineering judgment.

## Current diagnosis

The existing page has a solid base:

- Dark visual system with a recognizable amber accent.
- Clean typography and usable spacing.
- A good About Me paragraph.
- A Technical Skills section with a more distinctive collapsible/vertical-card interaction.
- A final Get in Touch / Beyond Code section that adds some personality.
- A real AI chat interaction backed by custom infrastructure.

However, the current interface still reads too much like a traditional CV:

- The hero is clean but generic.
- The chat is visually treated as a floating feature rather than the conceptual core of the page.
- The work experience section is too close to a standard resume card with long bullet lists.
- Education and certifications take too much visual weight compared with the more differentiated parts of the profile.
- The page does not yet expose the fact that `cv-chat` itself is a meaningful AI/software project.
- AI fluency is mentioned, but it is not yet framed as a concrete engineering practice.

## Target feeling

The renewed page should feel:

- Premium.
- Personal.
- Technical.
- Product-minded.
- Slightly futuristic, but not cyberpunk.
- Human, not corporate.
- Interactive, but not gimmicky.
- More like a crafted product interface than a template portfolio.

A good mental model:

> Personal AI Workbench.

Not a SaaS dashboard. Not a hacker terminal. Not an Awwwards gimmick. A polished professional interface where conversation, structured information, and visual hierarchy work together.

## Strategic principles

### 1. The chat must become the concept, not a widget

The chat is currently the most differentiated idea, but it should be more integrated into the page.

The interface should invite visitors to ask questions from the hero and from relevant sections:

- What kind of engineer is Miguel?
- Show me his AI workflow.
- What has he built at Santander?
- How does this CV chat work?
- What makes him a strong frontend/platform engineer?

The chat should feel like a navigation layer over the CV, not just a support bubble.

### 2. The page itself should demonstrate AI fluency

Avoid generic claims like "I use AI tools".

Instead, show AI fluency through concrete practices:

- Context engineering.
- Deterministic retrieval before LLM calls.
- Profile facts, projects, and memories as curated knowledge.
- One-call agent runtime for speed and predictability.
- Streaming UI.
- Human review and quality control.
- Regression tests for important retrieval behavior.

The page should quietly say:

> This person understands how to build useful AI-assisted software without overengineering it.

### 3. Replace CV structure with value narrative

The content should not be organized only as:

- About.
- Experience.
- Education.
- Skills.
- Contact.

Instead, the page should move toward:

- Hero / positioning.
- About / value statement.
- How this CV works.
- AI Engineering Fluency.
- Work Signals.
- Experience Archive.
- Technical Skills.
- Credentials & Learning.
- Beyond Code / Contact.

This makes the page feel less administrative and more strategic.

### 4. Use work signals instead of long bullet lists

Long resume bullets are useful, but they are not memorable.

Experience should be reframed around signals:

- Design systems at scale.
- UI platform engineering.
- Accessibility and consistency.
- Storybook documentation.
- Release workflows and semantic versioning.
- Cross-team frontend support.
- AI-assisted delivery.
- Product-minded engineering.

The detailed CV can still exist, but the interface should lead with interpretation and signal.

### 5. Keep education and certifications compact

Education and certifications matter, but they should not visually dominate the page.

They should become a compact `Credentials & Learning` section:

- MSc Computer Science.
- Exchange Program at Aalto University.
- BSc Computer Science.
- Professional Scrum Master I.
- Animations on the Web.
- Google GenAI Intensive / lightweight RAG exposure, if appropriate.
- AI-assisted development workflows.

The focus should stay on what Miguel can build and how he thinks.

### 6. Avoid overclaiming

The page should be ambitious but honest.

Do not overstate:

- Production RAG experience.
- Private company metrics.
- Project scale.
- AI expertise beyond what is actually supported.
- Availability or hiring preferences unless explicitly true.

The tone should be confident but grounded.

## Proposed information architecture

Recommended long-term structure:

```text
Hero
↓
About / Positioning
↓
How this CV works
↓
AI Engineering Fluency
↓
Work Signals
↓
Experience Archive
↓
Technical Skills
↓
Credentials & Learning
↓
Beyond Code / Contact
```

This does not need to be implemented in one pass. The first implementation phase should focus on Hero and Experience.

## Hero direction

The hero should immediately connect Miguel's professional identity with the conversational nature of the page.

Current issue:

```text
Miguel García
Software Engineer
Building software, scalable design systems, and practical AI workflows.
```

This is clear but generic.

Suggested direction:

```text
Miguel García
Software Engineer building frontend platforms, design systems and AI-assisted workflows.

Explore my work through a conversational interface powered by a lightweight profile agent.
```

Possible prompt chips:

```text
What kind of engineer is Miguel?
Show me his AI workflow
What has he built at Santander?
How does this CV chat work?
```

The hero should show, not just tell, that this is an AI-enhanced profile.

## Experience direction

Current issue:

The experience section is visually heavy and too similar to a standard CV card. The timeline adds decoration but does not strongly improve storytelling.

Suggested approach:

Split the section into two layers:

1. `Work Signals`: a high-level interpretation of Miguel's professional value.
2. `Experience Archive`: compact role cards with role, company, period, mission, signals, and AI angle where relevant.

Example work signals:

```text
Design systems at scale
Building reusable UI infrastructure, documentation, and release workflows for frontend teams.

AI-assisted engineering
Using AI tools, MCP/context workflows, and structured prompts to speed up implementation without losing ownership.

Product-minded development
Balancing technical quality, maintainability, team adoption, and user/business value.
```

Example experience card:

```text
Current role
Frontend UI Platform Engineer
Open Digital Services · Santander Group
Sep 2024 — Present

Building and maintaining UI components for frontend teams across Grupo Santander.

Signals:
Design systems · Accessibility · Storybook · Release workflows · Semantic versioning · AI-assisted development

AI angle:
Using Copilot, MCP servers, and context engineering to improve implementation speed, code quality, and collaborative development.
```

## AI Engineering Fluency direction

This should become a later dedicated section.

Suggested pillars:

```text
Context Engineering
Structuring tasks, constraints, examples, and project knowledge so AI tools can produce useful output.

Agentic Interfaces
Experimenting with lightweight agent runtimes where deterministic logic prepares the context before the model call.

AI-Assisted Delivery
Using Copilot, Codex-style agents, MCP workflows, and LLM APIs to accelerate implementation, refactoring, documentation, and debugging.

Quality Control
Reviewing AI-generated output critically with attention to type safety, accessibility, edge cases, maintainability, and product fit.
```

This section should reference `cv-chat` itself as proof of practice.

## How this CV works direction

This should be a future flagship section.

Suggested copy:

```text
This page is not just a CV.

It is powered by a lightweight profile agent that selects relevant facts, projects, and public memories before answering your questions.

No fake autonomy. No over-engineered RAG. Just a fast, grounded assistant designed to help people understand how I think, build, and work.
```

Suggested flow diagram:

```text
Visitor question
↓
Intent detection
↓
Facts / projects / memories retrieval
↓
Grounded LLM response
↓
Streaming answer in the interface
```

Suggested modules:

- Intent-aware answers.
- Curated knowledge.
- Fast streaming UX.
- Regression-tested context.

## Visual direction

Keep:

- Dark base.
- Amber accent.
- Strong rounded cards.
- Technical but approachable mood.
- The current Technical Skills interaction, refined rather than replaced.

Improve:

- Stronger hero composition.
- More asymmetry.
- More interface-like modules.
- Better relationship between chat and content.
- Less generic card repetition.
- More visual language around `facts`, `projects`, `memories`, `signals`, `intent`, and `streaming`.

Possible UI motifs:

- Prompt chips.
- Agent activity indicators.
- Small system labels.
- Module headers like `signal`, `context`, `current`, `ask`.
- Thin connector lines or flow diagrams.
- Subtle background depth, noise, gradients, or animated glow.
- Section-level chat prompts.

Avoid:

- Excessive neon.
- Cyberpunk styling.
- Gratuitous 3D.
- Generic SaaS dashboard look.
- Long centered blocks everywhere.
- Large cards for low-priority content.
- Motion that harms readability.

## Chat integration ideas

The chat should be callable from the content.

Ideas:

- Hero prompt chips that send predefined questions.
- Section prompts such as `Ask about this role`.
- Experience cards with suggested questions.
- `How this CV works` CTA that asks the assistant to explain the architecture.
- Contact section prompt to draft an intro message.
- Optional visual agent activity state while streaming.

Potential prompt examples:

```text
What kind of engineer is Miguel?
Summarize Miguel's current role.
How does Miguel use AI in development?
What is the architecture behind this CV chat?
What makes Miguel a good frontend platform engineer?
```

## Implementation philosophy

Work in phases.

### Phase 1: Hero + Experience

- Rework hero positioning and layout.
- Add prompt chips and stronger chat framing.
- Replace the current experience timeline/card format with Work Signals + Experience Archive.
- Preserve the rest of the page unless necessary.

### Phase 2: AI Fluency + How this CV works

- Add a dedicated AI Engineering Fluency section.
- Add a `How this CV works` section explaining the lightweight profile agent.
- Connect the content to the actual Worker/profile-agent architecture.

### Phase 3: Education + Certifications cleanup

- Replace large education/certification cards with compact `Credentials & Learning`.
- Keep proof points but reduce visual weight.

### Phase 4: Deeper chat integration and motion

- Add contextual prompts to sections.
- Improve agent activity feedback.
- Add subtle motion and visual polish.
- Consider one carefully chosen 3D or animated asset only if it reinforces the concept.

## Success criteria

The renewed page succeeds if a visitor remembers:

- Miguel is not just a software engineer; he is a product-minded frontend/platform engineer.
- He works with design systems, maintainability, and practical AI workflows.
- The chat is not a gimmick; it is part of a real custom AI interface.
- The page itself demonstrates taste, technical skill, and modern AI fluency.
- The experience section communicates value quickly without feeling like a generic resume.

## Codex guidance

When using Codex to implement this renewal:

- Prefer focused, incremental changes.
- Keep the current working chat backend intact.
- Do not rewrite the whole site at once.
- Preserve responsive behavior and current theme support.
- Run `npm run build` after changes.
- Run `npm run test:profile-agent` when profile-agent knowledge, prompts, or retrieval-related behavior changes.
- Avoid adding dependencies unless there is a clear payoff.
- Keep copy factual, grounded, and aligned with the profile knowledge used by the chat backend.
