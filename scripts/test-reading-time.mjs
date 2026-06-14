import assert from "node:assert/strict";

import {
  countReadableWords,
  estimateReadingMinutes,
  formatReadingTime,
} from "../src/lib/reading-time.js";

assert.equal(countReadableWords("One two three"), 3);

assert.equal(
  countReadableWords(`
---
title: "Ignored frontmatter"
---

# Heading

This is **Markdown** with [a link](https://example.com).

<iframe src="https://www.youtube.com/embed/demo" title="Demo video"></iframe>
  `),
  7,
);

assert.equal(estimateReadingMinutes(""), 1);
assert.equal(estimateReadingMinutes("word ".repeat(201)), 2);
assert.equal(formatReadingTime("word ".repeat(351)), "2 min read");

console.log("reading-time tests passed");
