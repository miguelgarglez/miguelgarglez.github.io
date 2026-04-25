# Codex Plan: AI Fluency and How This CV Works

## Scope

This document defines the second implementation phase for the `cv-chat` renewal.

Focus on adding two high-impact sections after the Hero/About area and before the more traditional CV content:

1. `How this CV works`
2. `AI Engineering Fluency`

Do not rework Hero or Experience in this phase unless small integration changes are needed after Phase 1.

## Product goal

Make the page's strongest differentiator visible: `cv-chat` is not just a portfolio with a chat button. It is a real conversational professional profile backed by a lightweight profile-agent runtime.

This phase should help visitors understand that Miguel does not only use AI tools casually; he thinks about AI-assisted development in terms of context, retrieval, workflow design, human review, and maintainability.

The page should communicate:

- The chat is powered by a deliberately simple AI architecture.
- Miguel understands how to build practical AI-assisted interfaces.
- AI fluency is presented through concrete engineering practices, not buzzwords.
- The portfolio itself is a proof-of-work project.

## Important context

The repository already includes:

- Astro frontend.
- Cloudflare Worker chat backend.
- SSE streaming response handling.
- OpenAI-compatible upstream LLM call.
- Lightweight `runProfileAgent()` runtime.
- Deterministic context selection before the LLM call.
- Knowledge files for profile facts, profile data, projects, and public memories.
- Retrieval regression tests through `npm run test:profile-agent`.

This phase should surface that architecture at a product/storytelling level without turning the page into technical documentation.

## Current problem to solve

The existing page mentions AI workflows, but the visitor does not yet understand the depth behind them.

The chat currently risks being perceived as:

- A fun widget.
- A wrapper around a generic LLM.
- A portfolio novelty.

The desired perception is:

- A considered AI interface.
- A practical profile-agent implementation.
- A real example of modern AI-assisted engineering.
- A professional differentiator.

## New section 1: How this CV works

### Section purpose

Explain, in a concise and visual way, that `cv-chat` is powered by a lightweight profile agent that selects relevant context before answering.

This section should be understandable for non-technical recruiters, but interesting enough for engineers.

### Suggested placement

Recommended placement:

```text
Hero
↓
About Me
↓
How this CV works
↓
AI Engineering Fluency
↓
Work Signals / Experience
```

If the page feels too dense, this section can come immediately after Hero and before About Me, but the recommended first implementation is after About Me.

### Suggested copy

```text
How this CV works

This page is not just a static CV with a chat button.

When you ask a question, a lightweight profile agent selects relevant facts, projects, and public memories before sending a grounded prompt to the model. The answer then streams back into the interface.

No fake autonomy. No over-engineered RAG. Just a fast, grounded assistant designed to make a professional profile easier to explore.
```

Alternative shorter version:

```text
This portfolio is queryable.

A lightweight profile agent classifies your question, selects relevant context from curated profile knowledge, and streams a grounded answer back to the interface.
```

### Visual structure

Use a horizontal or vertical process flow:

```text
Question
↓
Intent
↓
Context
↓
Model
↓
Streaming answer
```

More explicit version:

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

### Suggested modules

```text
Intent-aware answers
The assistant detects whether a visitor is asking about experience, projects, skills, contact, education, or recent updates.

Curated knowledge
Responses are grounded in structured profile facts, project data, and public memories instead of generic internet knowledge.

Fast streaming UX
The frontend receives streamed events so the interaction feels immediate and conversational.

Regression-tested context
Important profile questions are protected by deterministic retrieval tests, reducing the chance of broken context selection.
```

### Tone

Use precise but accessible language.

Avoid phrases that sound inflated:

- Revolutionary AI CV.
- Autonomous agent.
- Advanced RAG system.
- Production-grade agent platform.

Prefer grounded phrases:

- Lightweight profile agent.
- Deterministic context selection.
- Curated profile knowledge.
- Streaming interface.
- Practical AI workflow.

## New section 2: AI Engineering Fluency

### Section purpose

Show that Miguel uses AI as part of an engineering workflow, not as a replacement for judgment.

This section should answer:

> What does AI fluency mean in Miguel's work?

### Suggested copy

```text
AI Engineering Fluency

I use AI as an engineering multiplier, not as a replacement for technical judgment. My focus is on using AI to move faster while keeping ownership over architecture, maintainability, and product quality.
```

### Suggested pillars

```text
Context Engineering
Structuring tasks, constraints, examples, repository conventions, and acceptance criteria so AI tools produce useful output instead of generic code.

Agentic Interfaces
Experimenting with lightweight agent runtimes where deterministic logic prepares context before a single model call.

AI-Assisted Delivery
Using tools such as GitHub Copilot, Codex-style agents, MCP workflows, and LLM APIs to accelerate implementation, refactoring, documentation, and debugging.

Quality Control
Reviewing AI-generated output critically, with attention to type safety, accessibility, edge cases, maintainability, and product fit.
```

Optional fifth pillar:

```text
Product Judgment
Using AI to explore alternatives, clarify requirements, and reduce execution friction while keeping final decisions grounded in user value and engineering trade-offs.
```

### Visual structure

Use a modular grid with strong hierarchy.

Possible card labels:

```text
practice 01
practice 02
practice 03
practice 04
```

Or:

```text
context
agent runtime
delivery
review
```

Make the section feel like an engineering operating model, not a list of generic skills.

### Link to cv-chat itself

Add a small proof-of-work callout:

```text
This portfolio is one example: a static Astro frontend connected to a Cloudflare Worker that powers a grounded profile assistant with streaming responses and deterministic context selection.
```

This callout should visually connect `AI Engineering Fluency` with `How this CV works`.

## Suggested interaction ideas

Add prompt chips that can open/send/pre-fill chat prompts if the current chat architecture supports it.

Suggested prompts for `How this CV works`:

```text
Explain how this CV chat works
What is the profile agent doing?
How is the assistant grounded?
```

Suggested prompts for `AI Engineering Fluency`:

```text
How does Miguel use AI in development?
What is Miguel's AI workflow?
How does Miguel review AI-generated code?
```

Minimum implementation:

- Render prompt chips with `data-chat-prompt` attributes.
- Do not block the phase if full programmatic chat integration is not already available.

Best implementation:

- Clicking a prompt opens the chat and sends/pre-fills the prompt.

## Implementation approach

### Step 1: Inspect current page structure

Find the `/cv-chat/` Astro page and related components.

Identify whether there is already a section component pattern, such as:

- Hero component.
- About component.
- Skills component.
- Experience component.
- Contact component.

Follow the existing conventions unless they make the new sections hard to maintain.

### Step 2: Add data/content structure if useful

If existing content is hardcoded, hardcoding these two sections is acceptable.

If the project already has data objects for sections/cards, create small arrays such as:

```ts
const cvChatFlowSteps = [
  { label: 'Question', description: 'Visitor asks about Miguel...' },
  ...
];

const aiFluencyPractices = [
  { title: 'Context Engineering', description: '...' },
  ...
];
```

Do not over-abstract.

### Step 3: Build `How this CV works`

Minimum:

- Section title.
- Short explanatory paragraph.
- Flow diagram/list.
- Four supporting modules.

Better:

- Add an interface-like visual treatment.
- Add a small `profile agent` status/module.
- Add prompt chips.

### Step 4: Build `AI Engineering Fluency`

Minimum:

- Section title.
- Positioning paragraph.
- Four pillar cards.
- Proof-of-work callout referencing `cv-chat` architecture.

Better:

- Create a more distinctive layout than a standard card grid.
- Visually connect each practice to actual tools/workflows.
- Add contextual prompt chips.

### Step 5: Maintain visual consistency

Use the existing design language:

- Dark background.
- Amber accents.
- Rounded panels.
- Strong typography.
- Subtle borders.

But avoid simply duplicating existing generic cards. These sections should feel like interface modules.

### Step 6: Responsive pass

Check:

- Flow diagram on mobile.
- Pillar card wrapping.
- Prompt chip wrapping.
- Spacing between About, new sections, and Experience.
- Chat floating button overlap.

### Step 7: Validation

Run:

```bash
npm run build
```

If you update profile-agent knowledge files or prompts used by the backend, also run:

```bash
npm run test:profile-agent
```

For this phase, frontend-only additions do not require profile-agent tests unless backend knowledge changes.

## Acceptance criteria

### How this CV works

- A visitor can understand that the chat is powered by a lightweight profile agent.
- The architecture is explained without becoming too technical.
- The section makes `cv-chat` feel intentional and differentiated.
- The section avoids overclaiming about autonomy or RAG depth.

### AI Engineering Fluency

- AI fluency is framed as practical engineering behavior.
- The section includes context engineering, agentic interfaces, AI-assisted delivery, and quality control.
- The copy feels confident but grounded.
- The section connects naturally to Miguel's current positioning.

### Technical

- Existing chat functionality remains working.
- No backend behavior is changed unless explicitly necessary.
- No unnecessary dependencies are added.
- Build passes.

## Suggested commit breakdown

```text
feat(cv-chat): add how this cv works section
feat(cv-chat): add ai engineering fluency section
style(cv-chat): polish ai sections responsive layout
```

## Copy bank

### How this CV works

```text
How this CV works

This page is not just a static CV with a chat button.

When you ask a question, a lightweight profile agent selects relevant facts, projects, and public memories before sending a grounded prompt to the model. The answer then streams back into the interface.

No fake autonomy. No over-engineered RAG. Just a fast, grounded assistant designed to make a professional profile easier to explore.
```

### Flow labels

```text
Question
Intent
Context
Model
Streaming answer
```

### Module copy

```text
Intent-aware answers
The assistant detects whether a visitor is asking about experience, projects, skills, contact, education, or recent updates.

Curated knowledge
Responses are grounded in structured profile facts, project data, and public memories.

Fast streaming UX
The frontend receives streamed events so the interaction feels immediate and conversational.

Regression-tested context
Important profile questions are protected by deterministic retrieval tests.
```

### AI Engineering Fluency intro

```text
AI Engineering Fluency

I use AI as an engineering multiplier, not as a replacement for technical judgment. My focus is on using AI to move faster while keeping ownership over architecture, maintainability, and product quality.
```

### AI pillars

```text
Context Engineering
Structuring tasks, constraints, examples, repository conventions, and acceptance criteria so AI tools produce useful output instead of generic code.

Agentic Interfaces
Experimenting with lightweight agent runtimes where deterministic logic prepares context before a single model call.

AI-Assisted Delivery
Using tools such as GitHub Copilot, Codex-style agents, MCP workflows, and LLM APIs to accelerate implementation, refactoring, documentation, and debugging.

Quality Control
Reviewing AI-generated output critically, with attention to type safety, accessibility, edge cases, maintainability, and product fit.
```
