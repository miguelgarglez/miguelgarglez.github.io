# Home Directory Plan

This plan captures the intended evolution of the Personal Site Home from a lightweight index into a more complete curated directory.

## Direction

The Home should remain a curated directory first. It should help visitors understand what Miguel builds, writes, reads, and learns from, without becoming a chronological blog feed or a generic landing page.

The directory should organize four main surfaces:

- Projects: things Miguel builds or contributes to.
- Posts: authored articles or short notes by Miguel.
- Readings: external resources Miguel curates because they shaped his taste, learning, or thinking.
- People: people whose work, teaching, writing, product judgment, or craft shape Miguel's taste and thinking.

Ideas remain the broader editorial intent of the Home, not a dedicated section for now.

## Current State

- The Home exists at `/` and already presents projects and people.
- Project data lives in `src/data/projects.ts`.
- People data lives in `src/data/people.ts`.
- Project detail pages exist at `/projects/[slug]`.
- A people index exists at `/people`.
- Posts and Readings are not implemented yet.
- The root `CONTEXT.md` defines the domain language for Home, Project Directory, Post, Reading, and Person Reference.

## Product Decisions

- The Home shows curated selections, not complete lists.
- Dedicated section pages provide deeper browsing.
- The first implementation should establish the portal structure before adding substantial new content.
- The Home section order should be:
  1. Projects
  2. Posts
  3. Readings
  4. People
- The Home should show up to 3 featured Projects.
- The Home should show up to 2 featured Posts once Posts exist.
- The Home should show up to 3 featured Readings once Readings exist.
- The Home should show up to 3 featured Person References.
- Posts shown on the Home should be featured/curated, not merely the latest.
- `/posts` can order posts by date descending.
- Posts may be written in English or Spanish, with the language declared per post.
- Post URLs should use simple slugs, such as `/posts/why-this-site-is-a-directory`, without date segments.
- Posts can include an optional `updatedDate`.
- RSS should not be included initially.
- Readings should use English notes for consistency with the public directory.
- People remains scoped to people only.
- Readings covers external resources that are not people.
- Ideas should not become a section until a clearer need emerges.

## Content Model

### Projects

Keep projects in structured TypeScript data.

Expected surfaces:

- Home curated selection.
- `/projects` full project index.
- `/projects/[slug]` detail pages.

The existing project model is already rich enough for this direction: slug, display name, links, stack, status, year, category, stage, featured flag, role, summary, and capabilities.

### Posts

Use Astro Content Collections with Markdown or MDX.

Posts should support:

- `title`
- `description`
- `date`
- `updatedDate` when useful
- `kind`: article or note
- `lang`: en or es
- `tags`
- `featured`
- `draft`

Draft posts should be excluded from production output.

The first real post should be a short strategic piece such as `Why this site is a directory`. It should explain why the Personal Site is a curated map rather than a traditional blog or landing page.

This first post should be written in English and use a simple slug such as `why-this-site-is-a-directory`.

### Readings

Keep readings in structured TypeScript data at first.

Readings should support:

- `slug`
- `title`
- `author`
- `type`: book, article, newsletter, paper, video, or similar
- `href`
- `area`: a small closed set such as design, engineering, product, ai, career, or writing
- `note`
- `tags`
- optional lightweight relationships to related posts or projects
- `featured`

Do not create `/readings/[slug]` initially. Start with a single `/readings` index.

### People

Keep people in structured TypeScript data.

The current `/people` page already supports the intended direction: grouping people by area and explaining what Miguel learns from them.

Person References should include a `featured` flag so the Home can show a curated subset without relying on list order.

## Navigation

The portal navigation should evolve from a Home-only section index into a real directory navigation.

Desktop:

- Keep the sidebar pattern.
- Include Home, Projects, Posts, Readings, and People.
- Mark the active section or page.

Mobile:

- Provide compact navigation that keeps the main sections reachable.
- Avoid hiding the directory structure behind unclear interaction.

Home links can scroll to curated sections, while section pages should link to their dedicated routes.

## Index Page Grammar

Directory section pages should share a common visual grammar, without forcing premature component abstraction.

Each index page should include:

- Consistent directory navigation.
- An eyebrow in the form `Miguel Garcia - {Section}`.
- A clear title that describes the section's role in the directory.
- A short lead that explains why the section exists.
- A scannable list or grouped list.
- Consistent active navigation state.

Projects, Posts, Readings, and People may differ in their card details, but they should feel like parts of the same Personal Site.

## Initial Implementation Phases

### Phase 1: Directory Structure

- Add `/projects` as the full project index.
- Add shared navigation for Home, Projects, Posts, Readings, and People.
- Adjust Home to show curated selections rather than treating itself as the only full listing.
- Show up to 3 featured Projects and up to 3 featured Person References on the Home.
- Add `featured` to Person References.

Done criteria:

- `/` shows curated selections rather than complete section lists.
- `/projects` exists and shows all projects.
- `/people` still shows all Person References.
- Directory navigation works on desktop and mobile.
- The Home shows no more than 3 featured Projects.
- The Home shows no more than 3 featured Person References.
- `src/data/people.ts` includes an explicit `featured` flag.
- The root build passes.
- `/`, `/projects`, `/people`, and at least one `/projects/[slug]` route are visually checked.

### Phase 2: Readings

- Add `src/data/readings.ts`.
- Add a curated Readings section to the Home.
- Add `/readings` as the full readings index.
- Use simple grouping by area, with tags as secondary metadata.

### Phase 3: Posts

- Configure Astro Content Collections for posts.
- Add `/posts` index.
- Add `/posts/[slug]` detail pages.
- Support `draft`, `featured`, `kind`, `lang`, and tags.
- Add the first real post: `Why this site is a directory`.

### Phase 4: Home Polish

- Rebalance the Home around the final order: Projects, Posts, Readings, People.
- Make section headings and cross-links consistent.
- Keep the visual language aligned with the current Personal Site unless a redesign is explicitly requested.

### Phase 5: Verification

- Run the root build.
- Verify desktop and mobile views for `/`, `/projects`, `/posts`, `/readings`, `/people`, and at least one project/post detail route.
- Check that draft posts do not appear in production output.
- Check that internal links point to real routes.

## Deferred

- Search and advanced filters.
- Dedicated reading detail pages.
- A standalone Ideas section.
- CMS integration.
- Comments, likes, analytics-driven sorting, or newsletter workflows.

These should only be reconsidered once the directory has enough content volume to justify them.
