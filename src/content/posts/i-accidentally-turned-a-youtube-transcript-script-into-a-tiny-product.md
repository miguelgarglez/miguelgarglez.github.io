---
title: "I accidentally turned a YouTube transcript script into a tiny product"
description: "A small product launch note for Video Digest, a local CLI and TUI for turning YouTube videos into transcripts and structured digests."
date: 2026-06-24
kind: "article"
lang: "en"
tags: ["ai", "cli", "product", "youtube", "agents", "automation"]
featured: false
draft: false
---

I only wanted fewer unwatched YouTube videos.

Naturally, I ended up publishing a macOS-only CLI.

This is probably not the most reasonable path from problem to solution, but it is a very honest one. I had a playlist full of videos I was saving “for later”, which mostly meant “for never”. I wanted a way to turn some of that backlog into something I could actually use: transcripts, summaries, notes, maybe eventually entries in my knowledge base.

The first version was not a product. It was a small workflow. Codex would open a YouTube video, find the transcript, summarize it, and send me an email. It worked well enough to be exciting and badly enough to be suspicious.

The browser is a weird place to put trust.

Transcript panels move. YouTube changes the page. Videos have missing captions. Some transcripts are auto-generated. Some are in the wrong language. Some are just not there. And if an automation is going to modify a playlist after processing a video, “pretty sure it worked” is not a good commit protocol.

So I pulled the useful part out into a local tool.

It is called [`video-digest`](https://github.com/miguelgarglez/personal-video-digest).

The pitch is simple:

```text
YouTube URL
-> Transcript
-> Digest
-> Local artifacts you can inspect, copy, open, and reuse
```

There is no dashboard. There is no account. There is no “AI workspace”. It is a small local command that tries to do one job with enough taste and discipline that I do not feel embarrassed using it twice.

You can install the current public package with:

```sh
npm install --global video-digest
```

Then run:

```sh
video-digest
```

That opens the human interface: a terminal UI for choosing a local Artifact Library, creating a Digest, fetching only a Transcript, browsing previous entries, changing settings, or running diagnostics.

The direct commands are there too:

```sh
video-digest transcript "https://www.youtube.com/watch?v=..."
video-digest ingest "https://www.youtube.com/watch?v=..."
video-digest list
video-digest open latest
video-digest doctor
```

I like that shape. The TUI is for humans. The commands and JSON contracts are for scripts and agents. Same tool, different surface.

That became one of the main design constraints: if agents are going to use this, the CLI needs to behave like a real product, not like a pile of prompts wearing a trench coat.

So the boring parts started to matter a lot.

`video-digest` writes an Artifact Library instead of dumping one giant response to stdout. A video becomes a local entry with metadata, Markdown, clean text, and canonical JSON:

```text
Video Digest/
├── digests/1ZgUcrR0K7I.md
├── metadata/1ZgUcrR0K7I.json
└── transcripts/
    ├── 1ZgUcrR0K7I.json
    ├── 1ZgUcrR0K7I.md
    └── 1ZgUcrR0K7I.txt
```

Transcript-only mode does not require an LLM API key. Digest mode currently uses an OpenCode API key stored in macOS Keychain. The Python transcript runtime is prepared explicitly, with user consent, using locked dependencies. There are no surprise `postinstall` scripts doing mysterious things to your machine.

This is the part of product work I enjoy more than I expected: making the small tool feel safe.

For example, getting a transcript is not enough. The tool scores transcript quality with deterministic checks before trusting it: segment count, duration, text length, average characters per minute, timestamps, and expected language. Nothing glamorous. Exactly the kind of unsexy guardrail that makes the next step more useful.

The same thing happened around output. If the transcript is useful, I want to copy it, print it, open the Markdown, or let an agent read the stable JSON. If the transcript is not useful, I want a clear reason, not a confident hallucination sitting in a nice heading.

At some point the project crossed an invisible line.

It stopped being “my script” and started needing the things a real package needs:

- a proper README;
- a TUI that feels like the primary human interface;
- stable command behavior;
- documented JSON contracts;
- a portable agent skill;
- package verification before publish;
- npm Trusted Publishing;
- Release Please for changelogs, tags, and GitHub Releases;
- CI that tests the exact packed tarball, not only the source tree.

None of those features make a YouTube transcript better.

But they make the tool more real.

I think that distinction matters. There are many AI side projects that demo well once. The interesting work is turning the demo into something boring enough to rely on. Boring is not the enemy of magic. Boring is the container that lets the magic survive contact with Tuesday.

The funny part is that `video-digest` is still very small.

It is public, experimental, English-only software. It supports macOS on Apple Silicon. The transcript source is still limited. The digest provider story is still too narrow. It is not trying to be a cross-platform media intelligence suite, which is both a limitation and a relief.

But it has a point of view:

> Your video backlog should become local, reviewable artifacts — not another feed.

That is the product.

Not “summarize any video with AI”.

More like: take one video you explicitly selected, extract the useful material, write it down in a durable shape, and give both humans and agents clean handles to work with it.

I also like that it does not hide the file system. The Artifact Library is part of the experience. You can open the Markdown. You can inspect the JSON. You can use the clean transcript in another tool. You can delete it. You can move it. It is yours.

The next obvious step is provider support.

Right now Digest generation is wired around OpenCode. That was enough to validate the shape, but it should not be the only option. I would like to support other model providers so the CLI can be configured around whatever API key the user already has: OpenAI, Anthropic, maybe local models later if the quality is good enough.

I do not think that part is conceptually hard. The important thing is to keep the provider boundary boring:

```text
Transcript + metadata
-> Digest request
-> Structured Markdown Digest
```

If that boundary stays clean, adding providers should be more configuration than surgery.

There are other directions too:

- better transcript fallbacks, probably starting with `yt-dlp`;
- smarter handling of missing or poor captions;
- more portable setup beyond macOS Apple Silicon;
- richer digest templates for different kinds of videos;
- stronger knowledge-base export for the best outputs;
- a tighter agent workflow for processing a personal queue.

But I do not want to rush all of that.

The current version already does something useful: it turns a video into artifacts I can inspect and reuse. That is enough for a first product shape.

So this is the tiny launch:

```sh
npm install --global video-digest
video-digest
```

Bring your own YouTube URL. Bring your own OpenCode key if you want Digests. Or skip the model entirely and just pull clean transcripts.

It is a small tool, but it has ambitions in the right places: local-first artifacts, explicit setup, agent-friendly contracts, and a human interface that does not make the terminal feel like a punishment.

I started with a playlist called `Resumir`.

I somehow ended up with release automation.

Honestly, that feels about right.
