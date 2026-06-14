# Blog Post UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Upgrade blog post pages with estimated reading time, a subtle scroll progress bar, and richer Markdown styling.

**Architecture:** Keep the existing Astro post route and single-column layout. Add one small tested reading-time utility, render richer metadata in the post hero, initialize progress only when post progress markup exists, and scope editorial CSS to `.post-body`.

**Tech Stack:** Astro 6, TypeScript/Astro components, plain JavaScript, CSS variables, Node built-in assertions for the utility test.

---

## File Structure

- Create `src/lib/reading-time.js`: dependency-free reading-time utility used by Astro and tested by Node.
- Create `scripts/test-reading-time.mjs`: Node assertion tests for the reading-time utility.
- Modify `src/pages/posts/[slug].astro`: import the utility, render reading metadata, and include progress markup.
- Modify `src/layouts/BaseLayout.astro`: add an early-exit progress initializer to the existing site script.
- Modify `src/styles/global.css`: add reading progress, post metadata, and rich Markdown block styles.

## Tasks

### Task 1: Reading-Time Utility

**Files:**
- Create: `src/lib/reading-time.js`
- Create: `scripts/test-reading-time.mjs`

- [x] **Step 1: Write the failing test**

Create `scripts/test-reading-time.mjs` with assertions for Markdown, HTML, empty input, and minimum read time.

- [x] **Step 2: Run test to verify it fails**

Run: `node scripts/test-reading-time.mjs`

Expected: FAIL because `src/lib/reading-time.js` does not exist yet.

- [x] **Step 3: Write minimal implementation**

Create `src/lib/reading-time.js` exporting `countReadableWords`, `estimateReadingMinutes`, and `formatReadingTime`.

- [x] **Step 4: Run test to verify it passes**

Run: `node scripts/test-reading-time.mjs`

Expected: PASS with no output except the script success message.

### Task 2: Post Metadata and Progress Markup

**Files:**
- Modify: `src/pages/posts/[slug].astro`

- [x] **Step 1: Import the reading-time utility**

Import `formatReadingTime` from `../../lib/reading-time.js`.

- [x] **Step 2: Calculate reading time from `post.body`**

Use `const readingTime = formatReadingTime(post.body ?? "");`.

- [x] **Step 3: Render progress markup and compact metadata**

Add a fixed progress element before the page `<main>`. Replace the single date paragraph with a metadata list containing date, reading time, and kind.

- [x] **Step 4: Run build**

Run: `npm run build`

Expected: build succeeds.

### Task 3: Progress Script

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [x] **Step 1: Add an initializer that exits on non-post pages**

Find `[data-reading-progress]`, `[data-reading-progress-bar]`, and `[data-post-body]`. Return immediately if any are missing.

- [x] **Step 2: Calculate scroll progress with `requestAnimationFrame`**

Calculate progress from article body top to article body bottom, clamp between 0 and 1, and set `--reading-progress`.

- [x] **Step 3: Wire initialization**

Call the initializer after the existing theme and mobile menu initializers.

- [x] **Step 4: Run build**

Run: `npm run build`

Expected: build succeeds.

### Task 4: Rich Markdown CSS

**Files:**
- Modify: `src/styles/global.css`

- [x] **Step 1: Add progress and metadata styles**

Style `.reading-progress`, `.reading-progress-bar`, and `.post-meta`.

- [x] **Step 2: Extend `.post-body`**

Add scoped styles for headings, lists, blockquotes, images, figures, captions, iframes, code, pre, hr, and tables.

- [x] **Step 3: Add responsive adjustments**

Ensure mobile metadata wraps cleanly and code/tables/media do not overflow.

- [x] **Step 4: Run build**

Run: `npm run build`

Expected: build succeeds.

### Task 5: Browser Verification

**Files:**
- No committed content changes required beyond implementation files.

- [x] **Step 1: Open the existing post in desktop viewport**

Use the running Astro dev server or start `npm run dev -- --host 127.0.0.1`.

- [x] **Step 2: Verify desktop**

Check the title, metadata, tags, body rhythm, and progress bar.

- [x] **Step 3: Verify mobile**

Resize to mobile width and check metadata wrapping, progress bar, text rhythm, and menu.

- [x] **Step 4: Verify progress behavior**

Scroll the post and confirm the bar advances from near 0 to 100 percent.

- [x] **Step 5: Final status**

Run `git status --short` and summarize changed files.
