---
title: "Turning my YouTube backlog into email digests"
description: "A short build note about a small Codex-assisted workflow that turns videos I save on YouTube into useful personal digests."
date: 2026-06-14
kind: "article"
lang: "en"
tags: ["ai", "automation", "knowledge-base", "youtube", "process"]
featured: false
draft: false
---

I save a lot of YouTube videos.

That sounds harmless, but it creates a small kind of debt. A 20-minute video is easy to save. A 90-minute interview is easy to save. Watching all of them with enough attention to extract something useful is much harder.

I did not want another generic summarizer. What I wanted was closer to a personal digestion loop:

```text
interesting video
-> transcript
-> useful digest
-> email I can read later
-> eventually, a personal knowledge base
```

The first idea was naive in a useful way. Maybe Codex could open YouTube, inspect the video transcript, summarize it, and send the result to my email. It worked surprisingly well for a manual test. YouTube exposes transcripts in the UI for many videos, and Codex could read the transcript, structure the ideas, and send me a Gmail message.

But it was also clear that this was fragile.

YouTube can show ads. The transcript panel can move. The browser session has to be logged in. The DOM can change. Some transcripts are auto-generated. Some videos do not have transcripts in the expected language. And if the automation is going to remove videos from a playlist after processing them, it needs to be careful about side effects.

The first real lesson was that summarization was not the hard part. The hard part was getting a transcript reliably enough to trust the rest of the pipeline.

So I started building a small local tool instead.

The CLI is called `video-digest`. It is built with [Bun](https://bun.com/) and TypeScript, with a small Python sidecar managed by [uv](https://docs.astral.sh/uv/). The sidecar uses [`youtube-transcript-api`](https://github.com/jdepoix/youtube-transcript-api) as the first transcript source.

The local command can fetch a transcript and write versioned artifacts:

```sh
video-digest transcript "https://www.youtube.com/watch?v=..."
```

It can also run a fuller ingestion flow:

```sh
video-digest ingest "https://www.youtube.com/watch?v=..." --email-preview
```

The tool saves transcripts, metadata, digests, and email previews under local `outputs/` folders. It also scores transcript quality with simple deterministic heuristics: segment count, text length, duration, average characters per minute, timestamps, and expected language.

Those heuristics are intentionally boring. That is the point. Before asking a model to summarize a video, I want to know whether the input looks usable at all.

At first I wired the digest generation to [OpenCode Zen](https://opencode.ai/docs/zen/), using a cheap model through an API. That was useful, but another option quickly became more interesting: let the CLI fetch only the transcript, then let Codex write a better digest directly from the transcript.

That became the current workflow:

```text
YouTube playlist "Resumir"
-> video-digest transcript
-> Codex-authored digest
-> Gmail
-> remove the processed video from the playlist
```

I created a private YouTube playlist called `Resumir`. When I add a video there, the Codex automation opens the playlist in the in-app browser, checks the sort order, extracts the first playlist row, normalizes the URL, and calls the CLI in transcript-only mode.

If the transcript is usable, Codex reads it and writes a digest in Spanish. The digest includes a short executive summary, the main thesis, grouped key ideas, useful timestamps, actions or ideas to investigate, connections to my own projects, and a verdict: watch fully, watch fragments, save as reference, or discard.

Then it sends the digest to my Gmail with a stable subject prefix:

```text
[Video Digest] <title>
```

Only after Gmail confirms the email was sent does Codex go back to YouTube and remove that video from `Resumir`.

That last detail matters. The playlist is the queue. Removing the video is the acknowledgement. If transcript fetching fails, if Gmail fails, or if YouTube shows an ambiguous menu, the video stays in the playlist.

The first successful runs processed videos from DHH, Peter Thiel, and Chip Huyen. That was enough to see that the loop was useful. It was also enough to expose where it was fragile.

For example, YouTube sometimes loaded the playlist HTML but did not hydrate the visible playlist rows. The data was present in the page scripts as `playlistVideoRenderer`, so Codex could use that as a read-only fallback to identify the next video. But I made the rule stricter for deletion: removing a video requires a rendered UI row that can be located by `videoId`.

That is the kind of boundary I want in this project. Be practical, but not reckless.

I also looked at other transcript options. [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) is a good local fallback candidate. SaaS APIs like [Supadata](https://supadata.ai/youtube-transcript-api), [TranscriptAPI](https://transcriptapi.com/), or [Apify actors](https://apify.com/topaz_sharingan/youtube-transcript-scraper) could make the system more reliable later. ASR tools could help when a video has no captions at all. But I did not want to add all of that before validating the basic loop with real videos.

There is a bigger architecture behind this, but I am trying to keep it honest:

```text
source playlist
-> transcript service
-> transcript quality
-> digest
-> delivery
-> knowledge storage
```

The durable part should be the core pipeline, not the particular trigger. Today Codex is acting as an operator. Later, the trigger could be polling with the [YouTube Data API](https://developers.google.com/youtube/v3/docs/playlistItems/list), a cron job, a tiny web app, or even n8n. The important thing is that the logic stays reusable.

This is not production infrastructure.

It depends on a private browser session. It depends on YouTube transcript availability. It depends on an unofficial transcript library. It depends on Gmail delivery. And the most valuable digest is still being written by Codex, not by a fully automated summarization service.

But it works well enough to be useful.

That is the part I like. It sits in a productive middle ground: not a polished product, not a throwaway prompt, but a working personal workflow. I can save a long video, forget about it, and later receive a structured digest that helps me decide whether to watch it, keep it as a reference, or move on.

The next step is not to automate everything blindly. It is to evaluate the quality of the digests, add better transcript fallbacks only where needed, and start saving the best outputs into a personal knowledge base.

For now, the system does one small thing:

it turns a YouTube backlog into emails I actually read.
