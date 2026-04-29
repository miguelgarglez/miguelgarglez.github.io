# Codex Plan: Credentials, Learning and Skills Cleanup

## Scope

This document defines the third implementation phase for the `cv-chat` renewal.

Focus on:

1. Reducing the visual weight of Education and Certifications.
2. Reframing them as an independent `Credentials & Learning` section.
3. Preserving and refining the existing Technical Skills section, because its collapsible/vertical-card interaction is one of the stronger current visual ideas.

Do not redesign Hero, Experience, `How this CV works`, or `AI Engineering Fluency` in this phase unless small spacing or ordering adjustments are needed.

## Product goal

Make the lower-middle part of the page feel less like a traditional CV and more like a curated professional profile.

Education and certifications should remain visible, but they should not compete with the stronger differentiators:

- Frontend/platform engineering.
- Design systems.
- AI-assisted workflows.
- The `cv-chat` agent itself.

The Technical Skills section should continue to feel interactive and distinctive, but it should be aligned with the new positioning and not read like a generic stack list.

## Current problems to solve

### Education and certifications

Current issues:

- Education cards are visually large and symmetrical.
- Certifications appear as another card grid, which makes the page feel repetitive.
- The content is useful, but it takes more visual attention than it deserves.
- The section feels closer to a traditional CV than to the renewed conversational/product interface.

### Technical Skills

Current strengths:

- The collapsible/vertical-card layout is visually more memorable than many other sections.
- It has personality and interaction.
- It can be kept as a recognizable feature of the page.

Current issues:

- It may need stronger content hierarchy.
- It should better reflect AI-assisted engineering and frontend/platform specialization.
- Some categories may feel broad or generic.

## Desired user impression

After this phase, a visitor should think:

> Miguel has a solid academic foundation and keeps learning, but the page prioritizes what he can build and how he works today.

And:

> His skills are not just a list of technologies; they are grouped around engineering practice areas.

## New section: Credentials & Learning

### Section purpose

Replace the separate heavy Education and Courses/Certifications presentation with one compact, curated section.

Suggested title:

```text
Credentials & Learning
```

Suggested subtitle:

```text
Academic foundation, recent learning, and ongoing areas of professional growth.
```

Alternative subtitle:

```text
The formal background and recent learning that support my engineering practice.
```

### Content structure

Split into two compact columns/blocks:

```text
Academic foundation
2022-2024  Master's Degree in Computer Science · Universidad Autónoma de Madrid
2023       Exchange Program · Aalto University, Helsinki, Finland
2018-2022  Bachelor's Degree in Computer Science · Universidad Autónoma de Madrid

Professional learning
Professional Scrum Master I · Scrum.org
Animations on the Web · Emil Kowalski
Google GenAI Intensive · Kaggle
Responsible AI and Prompt Engineering · Founderz
Full Stack Open · University of Helsinki
TOEIC - C1 CEFR Level · Capman Testing Solutions
```

Use only accurate items already represented in the site's content or profile knowledge. Do not invent certifications.

Decision: do not include a `Current focus` block here. That territory is already covered by Work Signals, Experience, and Skills. This section should act as supporting evidence: formal education plus verified professional learning.

Decision: keep years for academic foundation, because they clarify the formal education timeline. Do not show years for professional learning, because the section is curated by relevance rather than chronological history and each linked credential provides verification.

Decision: keep Aalto University as its own academic row. The exchange program is a useful international signal and is easier to scan when it is not hidden inside the master's degree row.

Decision: show all professional learning items at once. There are only six, and the old collapse interaction adds attention to a secondary section. The redesign should solve weight through layout, not by hiding content.

Decision: link all credential rows that already have URLs. The interaction should be quiet: the whole row can be clickable, with a small `lucide:arrow-up-right` affordance instead of repeated button text.

### Visual direction

Avoid large equal-height cards for each degree.

Prefer:

- Compact editorial list.
- Timeline strip.
- Credential rows.
- Small grouped panels.
- Badge-like date labels.
- Subtle dividers.

Example visual pattern:

```text
Credentials & Learning

[Academic foundation]
2022-2024  Master's Degree in Computer Science
           Universidad Autónoma de Madrid

2023       Exchange Program
           Aalto University · Helsinki, Finland

2018-2022  Bachelor's Degree in Computer Science
           Universidad Autónoma de Madrid

[Professional learning]
Professional Scrum Master I · Scrum.org ↗
Animations on the Web · Emil Kowalski ↗
Google GenAI Intensive · Kaggle ↗
Responsible AI and Prompt Engineering · Founderz ↗
Full Stack Open · University of Helsinki ↗
TOEIC - C1 CEFR Level · Capman Testing Solutions ↗
```

The section should be scannable and visually lighter than Experience or AI Fluency.

Recommended intro copy:

```text
Formal education and recent professional learning behind the engineering practice shown above.
```

## Technical Skills refinement

### Keep the core interaction

Do not remove the current collapsible/vertical-card concept unless it is technically broken or unmaintainable.

It is one of the few sections that already feels less generic.

### Suggested category model

Decision: keep the distinctive expandable/vertical-card interaction, but update the content model to be more honest about strength levels.

Final category model:

```text
Frontend Platform
Backend & Data Foundations
AI & Developer Tooling
Exploratory Engineering
```

Frontend Platform is the strongest professional area. Backend & Data Foundations are solid from Computer Science background and project work. AI & Developer Tooling should highlight practical work, especially the MCP server built to support component-library consumers with contextual guidance, integration patterns, troubleshooting, and migrations. Mobile/native should be framed as exploratory tinkering, not primary professional specialization.

### Suggested skill grouping

Example grouping:

```text
Frontend Platform
React · Astro · TypeScript/JavaScript · Design systems · Storybook · Accessibility · Component APIs · release quality

Backend & Data Foundations
Node.js · Python · Flask/Django · SQL/PostgreSQL/SQLite · MongoDB · REST/GraphQL exposure · data analysis

AI & Developer Tooling
GitHub Copilot · Windsurf · Devin · Codex · Prompt/context engineering · MCP workflows · component-consumer support tooling

Exploratory Engineering
Flutter · React Native · Swift/iOS/macOS tinkering · CI/CD · Vercel · Cloudflare Workers
```

Only include technologies that are already true and supported by the current profile.

### Development philosophy callout

The current Development Philosophy card is good in spirit. Keep or refine it.

Suggested updated copy:

```text
Strong fundamentals matter more than any single framework. Tools change quickly; good engineering judgment, maintainability, and product thinking compound over time.
```

Alternative:

```text
Technologies change. Engineering judgment compounds. I care about fundamentals, maintainability, and using the right tool for the product problem.
```

## Chat integration ideas

Add prompt chips if the pattern exists from earlier phases.

Suggested prompts for Credentials & Learning:

```text
Ask about academic background
Ask about recent learning
```

Suggested prompts for Skills:

```text
Summarize Miguel's frontend skills
How does Miguel use AI in development?
What is Miguel's strongest technical area?
```

Minimum implementation:

- Render prompt chips with `data-chat-prompt` attributes.

Best implementation:

- Prompt chips open/send/pre-fill the chat.

## Implementation approach

### Step 1: Inspect existing sections

Find current Education, Courses/Certifications, and Technical Skills components/content.

Determine whether they are:

- Hardcoded in the Astro page.
- Componentized.
- Generated from local data arrays.

### Step 2: Replace Education + Certifications with one compact section

Create or update a component such as:

```text
CredentialsLearningSection.astro
```

or keep it inside the existing page if that is simpler.

Do not preserve the large degree-card layout unless there is a strong visual reason.

### Step 3: Refine Technical Skills labels/content

Update category names and skill descriptions to match the renewed profile.

Keep the collapsible interaction and ensure it still works on desktop and mobile.

If current animation logic is fragile, simplify rather than overengineering.

### Step 4: Adjust spacing/order

Recommended order after previous phases:

```text
Hero
About
How this CV works
AI Engineering Fluency
Work Signals / Experience
Technical Skills
Credentials & Learning
Beyond Code / Contact
```

Technical Skills should likely come before Credentials & Learning, because skills are more important than academic history for the renewed positioning.

### Step 5: Responsive pass

Check:

- Credential rows on mobile.
- Skill cards and collapsed labels on narrow screens.
- Text wrapping in vertical cards.
- Touch targets.
- Section spacing.

### Step 6: Validation

Run:

```bash
npm run build
```

If profile-agent knowledge files are changed to align with the visible page, also run:

```bash
npm run test:profile-agent
```

If this phase only changes frontend markup/copy and does not affect backend knowledge, profile-agent tests are optional.

## Acceptance criteria

### Credentials & Learning

- Education and certifications are still visible.
- The section is more compact and less visually dominant.
- It feels curated rather than administrative.
- It supports the profile without distracting from Experience and AI Fluency.

### Technical Skills

- The existing distinctive interaction is preserved or improved.
- Categories better match Miguel's positioning.
- AI-assisted engineering appears as a real practice area, not a buzzword.
- The section remains readable and responsive.

### Technical

- Existing chat behavior remains working.
- No unnecessary dependencies are added.
- Build passes.

## Suggested commit breakdown

```text
refactor(cv-chat): replace education cards with credentials learning section
feat(cv-chat): refine technical skills around engineering practice areas
style(cv-chat): polish credentials and skills responsive layout
```

## Copy bank

### Credentials section

```text
Credentials & Learning

Formal education and recent professional learning behind the engineering practice shown above.
```

### Academic foundation

```text
2022-2024  Master's Degree in Computer Science
           Universidad Autónoma de Madrid

2023       Exchange Program
           Aalto University · Helsinki, Finland

2018-2022  Bachelor's Degree in Computer Science
           Universidad Autónoma de Madrid
```

### Professional learning

```text
Professional Scrum Master I · Scrum.org
Animations on the Web · Emil Kowalski
Google GenAI Intensive · Kaggle
Responsible AI and Prompt Engineering · Founderz
Full Stack Open · University of Helsinki
TOEIC - C1 CEFR Level · Capman Testing Solutions
```

### Development philosophy

```text
Technologies change. Engineering judgment compounds. I care about fundamentals, maintainability, and using the right tool for the product problem.
```
