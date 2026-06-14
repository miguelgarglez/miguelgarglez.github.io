# Blog Post UI Design

Date: 2026-06-14
Status: Approved for implementation planning

## Context

The personal site is an Astro directory published through GitHub Pages. Blog posts live in
`src/content/posts` and render through `src/pages/posts/[slug].astro`.

The current post UI is clean and aligned with the directory aesthetic, but the body only
styles paragraphs and links. That keeps short notes readable, but it does not yet support
strong editorial rhythm for longer posts, technical writing, images, pull quotes, or embedded
media.

The current sample post has about 351 words, so it reads as a short article. The design
should improve this case without overloading it, while preparing the template for richer
future posts.

## Chosen Direction

Use the "Minimal Reading Upgrade" direction.

Keep the existing single-column post composition and restrained visual language. Add useful
reading affordances and a complete Markdown styling system, but avoid a new side rail,
magazine layout, or dramatic template shift.

## Goals

- Improve readability and scanning for short and medium-length posts.
- Add estimated reading time without adding dependencies.
- Add a subtle reading progress bar that helps orientation on long pages.
- Support rich Markdown content: headings, quotes, images, captions, lists, code blocks,
  separators, tables, and embedded YouTube videos.
- Preserve the current directory site's quiet editorial tone.
- Keep writing new posts simple: authors should mostly write Markdown, not custom layout code.

## Non-Goals

- Do not migrate posts to MDX in this iteration.
- Do not add a table of contents or desktop reading rail yet.
- Do not redesign the home, directory navigation, or post listing page beyond small metadata
  consistency if needed.
- Do not install a reading-time package.
- Do not create bespoke components for every media block yet.

## UX Design

### Post Header

The post hero remains in the current `detail-hero post-hero` area.

Add a compact metadata row that can include:

- Publication date.
- Estimated reading time, for example `2 min read`.
- Post kind, such as `article` or `note`.

Tags remain visible, but should not compete with the title or description. They continue to
use the existing stack style unless implementation reveals a mobile wrapping problem.

### Reading Progress

Add a thin fixed progress bar at the top of the viewport when a post page is active.

Behavior:

- Starts at 0 percent near the top of the article.
- Reaches 100 percent near the end of the article body.
- Uses `--accent` for the filled portion.
- Uses a transparent or very soft track so it does not look like an app toolbar.
- Does not shift layout.
- Respects reduced-motion preferences by avoiding animated transitions when users request
  reduced motion.

This is intentionally subtle. It should feel like an instrument, not decoration.

### Markdown Body

The `.post-body` class becomes the editorial system for rendered Markdown.

Required styling:

- `h2` and `h3`: clear hierarchy, generous top spacing, tighter bottom spacing.
- `p`: preserve current comfortable line-height.
- `a`: keep current accent underline behavior.
- `ul` and `ol`: readable indentation and vertical rhythm.
- `blockquote`: pull quote treatment with a left accent rule and serif text.
- `img`: responsive width, stable display, softened edge if consistent with the site.
- `figure` and `figcaption`: captions in muted mono or sans style.
- `iframe`: responsive 16:9 media wrapper behavior for YouTube embeds.
- `code`: inline code treatment that is legible in light and dark themes.
- `pre`: scrollable code blocks with clear background, border, and mono font.
- `hr`: quiet section break.
- `table`: readable table layout with horizontal overflow on small screens.

### Media Authoring

Keep authoring simple for now.

Images can be written as normal Markdown:

```md
![Alt text](/images/example.jpg)
```

Pull quotes can be written as blockquotes:

```md
> Sometimes the useful signal is smaller.
```

YouTube embeds can use iframe HTML in Markdown:

```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Video title"
  loading="lazy"
  allowfullscreen
></iframe>
```

If rich embeds become common later, add explicit Astro or MDX components. For this iteration,
CSS support is enough and keeps the content pipeline simple.

## Technical Design

### Reading Time

Calculate reading time in `src/pages/posts/[slug].astro` at build time.

Implementation approach:

- Read the rendered post body source available from the content entry.
- Strip frontmatter and Markdown/HTML syntax enough to estimate word count.
- Count words with a Unicode-aware fallback if practical.
- Divide by 200 words per minute.
- Round up and clamp to at least 1 minute.

This avoids a dependency and is accurate enough for a personal blog. The key user-facing
promise is orientation, not a precise stopwatch.

### Progress Bar

Render a progress element only on post detail pages, for example:

```html
<div class="reading-progress" data-reading-progress aria-hidden="true">
  <span data-reading-progress-bar></span>
</div>
```

Use a small script in `BaseLayout.astro` or the post page to:

- Check if `[data-reading-progress]` exists.
- Find the article body.
- Calculate scroll progress from article start to article end.
- Set a CSS custom property or transform on the bar.
- Update on `scroll`, `resize`, and initial load.
- Use `requestAnimationFrame` to avoid excessive layout work during scroll.

Because `BaseLayout.astro` already owns small site-wide interaction scripts, adding the
initializer there is acceptable as long as it exits early on pages without the progress
element.

### CSS Scope

Add styles under the existing post section in `src/styles/global.css`.

Keep selectors scoped to `.post-body` or `.reading-progress` so project, people, and reading
pages are not affected.

Dark theme support must use existing CSS variables, not separate hard-coded palettes.

## Accessibility

- Keep semantic heading levels from Markdown.
- Ensure the progress bar is `aria-hidden`, because scroll position is already available to
  assistive technology and a constantly updating progress indicator would be noisy.
- Require useful `alt` text for meaningful images through normal Markdown authoring.
- Require `title` on YouTube iframes in examples and docs.
- Ensure focus states for links remain visible.
- Do not trap horizontal scroll in code blocks or tables.

## Verification

Implementation should verify:

- `npm run build` succeeds.
- The current post still looks restrained on desktop and mobile.
- Reading time appears in the header and reads correctly for the current sample post.
- Progress bar starts near 0 percent and reaches 100 percent by the article end.
- Rich Markdown test content visually covers headings, quotes, images, captions, code,
  lists, tables, separators, and YouTube iframes.
- Mobile width does not produce overlapping metadata, tags, code, tables, or embeds.
- Dark theme remains legible.

## Rollout Plan

Implement in one focused pass:

1. Add reading-time calculation and post metadata rendering.
2. Add reading progress markup and script.
3. Extend `.post-body` styles for rich Markdown.
4. Temporarily enrich the sample post or create a temporary local fixture for visual
   verification.
5. Run build and browser verification.

Do not commit temporary fixture content unless it is intentionally useful as real post
content.
