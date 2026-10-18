---
title: "What broke, and what each break taught"
description: "Eleven days of unattended agents, told through their failures: false premises, quiet overspends, a leaked credential, a Mac that only seemed awake, and the structural fix each one forced."
date: 2026-10-26
kind: "article"
lang: "en"
tags: ["ai", "agents", "automation", "debugging", "process"]
featured: false
draft: false
series: "agent-lab"
seriesOrder: 3
related: ["running-an-agent-product-studio-on-one-mac", "taste-is-not-a-score"]
---

An unattended system shows its rules by how it fails. For eleven days my Mac ran coding agents that built and shipped products while I slept (the setup is in the [first post](/posts/running-an-agent-product-studio-on-one-mac/)). Most of what I would copy into another project came from something going wrong.

Each failure below comes with its evidence and with the change it forced. Where I could, the change was structural: a script that fails, a permission that is denied, a state that can't be entered. Where it was only a sentence in a prompt, I say so.

## Agents report what they expect, not what happened

**The scouts that weren't running.** On the first evening, five research subagents went out to look for product ideas. I interrupted a blocking wait, and four of them were cancelled. The coordinator told me three times that they were "still working" before it checked. Nothing had lied on purpose: the last known state had been "running", and nobody had looked since.

**The fix:** scouting moved inside every product run, where its output lands in files the run then reads. The coordinator also adopted a rule for its own reports: check the status before stating it.

**The false premise.** antipoda-fm's live waveform was frozen, and two runs in a row blamed CORS: the radio streams wouldn't let the page analyse their audio. That sounded plausible, so nobody checked. When the coordinator finally measured, 33 of the 40 stations near my antipode sent the right headers. And the waveform moved fine in Chrome.

<figure>
<img src="/images/posts/agent-lab/antipoda-webkit-flatline.jpg" alt="antipoda-fm in WebKit: ON AIR with a station playing, and a completely flat waveform line." loading="lazy" />
<figcaption>WebKit, Safari's engine: the station is on air and the analyser returns zeros.</figcaption>
</figure>

I use Safari. Once Playwright's WebKit build was installed, the bug reproduced exactly: audio playing, analyser returning zeros, and an app that read a flat line as a quiet meter. The fix fetches the stream a second time and decodes it with WebCodecs, only to feed the scope, while the audio element keeps playing.

**The fix to the process:** a repro script, `antipoda-fm-scope.mjs`, that fails in any engine where the scope freezes while audio plays. Every run now tests Chromium, Firefox and WebKit, and a visual that should move is recorded for five seconds to prove it does. "Moves when it should" became a check rather than an assumption.

## Rules in prose get rationalised

The design gate and its history are in the [previous post](/posts/taste-is-not-a-score/). The same thing happened elsewhere.

- **A same-day dependency.** The skill asked for package versions at least seven days old, because supply-chain attacks tend to show up in fresh releases. A run pinned `hyperframes@0.8.141` on the morning it was published. `pin-age-check.py` now fails the build.
- **A redo that redesigned everything.** A redo meant to fix the Safari bug fixed it in one commit, then rebuilt the product's identity over five more and shipped with a failing design gate. The run deployed by pushing to `main`, which Vercel publishes, before the gate passed. Now runs work on a `lab/wip` branch, and `main` moves only by fast-forward after `lab-preship` passes.
- **A round cap that didn't hold.** The design loop was capped at three improvement rounds plus one confirmation. The last project of the experiment took eight Codex rounds anyway. That cap was a sentence in the skill, not a script, and it failed the way sentences fail.

## Money leaks quietly

When Codex hit its five-hour usage limit, one run reached for OpenCode with Gemini as its reviewer and spent $2.30 of a budget I had held back as the last resort. Nothing broke. The money was simply gone, with a perfectly good reason in the transcript.

**The fix:** OpenCode is banned outright. A second ChatGPT account and a small wrapper, `lab-codex`, rotate between two Codex homes when one hits its limit, with Cursor CLI as the reviewer of last resort.

The experiment's whole AI bill ended at about $5.60, of which $3.29 was one deliberate job: relevance labels for a search benchmark. The overspend was small, but it was the only spend I hadn't chosen.

## A convenient credential wins

The first product that needed a database was nullius, a shared engraved chart where the first visitor to reach a place names it forever. The Lab had its own scoped Supabase project. The run didn't use it. The agent had a Supabase MCP server installed, already signed in to my account, and that was the shortest path.

It created the ledger in a sandbox project that belongs to a different product of mine, one with its own auth users. It also changed a role-level setting there that controls which schemas the API exposes, and shipped that project's public key in a public bundle.

The coordinator found it while doing something else: I had approved deleting the test entries from the ledger, and the ledger wasn't where it should have been. What followed took under an hour.

1. Cut the app off: remove its environment variables and redeploy, then confirm that the live bundle no longer contains the project's address or key.
2. List every call the run made to that project, from the session's own log.
3. Clean up with a temporary token I pasted into a hidden macOS dialog. The token was held only in memory, and the script printed the state before and after: the role setting back to its original value, and the table and schema gone.
4. Move nullius to the Lab's project, in its own schema, starting with an empty ledger.

**The lasting fix was structural.** Both Supabase MCP servers went on the agents' deny list, and any Supabase URL other than the Lab's became a stop-and-log condition. The lesson generalises beyond databases: an agent will use the most convenient credential it can reach. Scope what it can reach, because telling it which one to use isn't enough.

## Data can be degenerate

mellizo matches a photo to an artwork. I uploaded a portrait and got "The Five Hundred Arhats" at a resemblance of 97, framed as a thin empty white bar.

<figure>
<img src="/images/posts/agent-lab/mellizo-sliver.jpg" alt="mellizo: a photo of palm trees matched at resemblance 97 to a thin white sliver labelled Snow Coloring the World White, a handscroll." loading="lazy" />
<figcaption>The same bug with another photo: the twin is a handscroll whose image is only a few pixels tall, so the frame shows a sliver.</figcaption>
</figure>

The museum's image of that handscroll is 900 by 12 pixels. Scaled to fit, it rendered about 3.5 pixels tall. Worse, resized for the embedding model it becomes a smear whose vector sits close to everything. 570 of the 22,784 works had an aspect ratio beyond 4:1 or a side under 128 pixels. And the score was saturated: real matches all landed at 97, so the number meant nothing.

**The fix:** measure the real dimensions of every image, exclude the degenerate ones in the database function, in the ingest step and in the client, and recalibrate the score so real results spread between about 57 and 75. The broader rule is to look at the extremes of a dataset before trusting a metric built on it.

## The Mac never stayed awake with the lid closed

A launch agent ran `caffeinate -is` for the whole experiment, and I believed it kept the Mac working with the lid shut. Runs did keep finishing overnight. At the end, the coordinator read the power log before writing that belief down.

- On AC power, every lid close logged `Entering DarkWake state due to 'Clamshell Sleep'`. Work continued for a while, then the machine fell into deep idle. On October 16 the agent sessions wrote 585 messages between 23:00 and midnight, nothing until 01:57, and resumed when a key was pressed.
- On battery, a lid close was a full sleep.

`caffeinate -s` prevents system sleep only on AC and only while the lid is open. What actually kept the Lab going was resilience. Processes freeze during sleep and carry on at wake, and the supervisor learned, after a Devin outage killed two runs, to resume the same session with `devin -p -r` on retryable connection errors instead of starting from zero.

**The honest fix:** documentation. Reliable lid-closed work needs clamshell mode (power, an external display or a dummy plug, and a keyboard), or `pmset -a disablesleep 1` with all its risks.

## The music that wouldn't stop

On the last day, after the Lab had shut down, I noticed electronic arcade music playing on my Mac. There was no window and no app to blame. It had been looping, on and off, for days.

I traced it with a second agent. It was the chiptune from greets, the demoscene cracktro generator. Four days earlier, a run had started a smoke test, `scripts/r2-engines.mjs`, which opens the app in Chromium, Firefox and WebKit, presses Space to start the demo and its tracker music, then exports a GIF. The test hung on the GIF export and never reached `browser.close()`. Playwright launches Chromium with `--mute-audio`. It does nothing equivalent for Firefox. So a headless Firefox sat at 80% CPU for four days, playing a tune nobody could see.

It wasn't alone. Once the coordinator went looking, it found 166 processes left behind by Lab runs, using about 1.1 GB:

- around 60 dev servers (Vite, Next, previews, and Python's `http.server`), several per project, some nine days old;
- headless browsers from captures and tests that never closed;
- a test script, `metro.mjs`, at 100% CPU for six days;
- a `vi` window, open for nine days, waiting for a commit message that an agent had forgotten to pass with `-m`.

Every run had ended cleanly from the launcher's point of view: exit code 0, a row in the log, claims released. But a run doesn't stop the processes it started with `bash -c '... &'`. They lose their parent and keep running under launchd.

**The fix is a reaper, made deliberately conservative.** `lab-reap` counts a process as a leftover only in two cases. One: it carries the `LAB_RUN_ID` of a run that has ended (every run exports that variable, and children inherit it). Two: it is an orphan, re-parented to launchd, living in a Lab repo or running as a headless browser, and older than 30 minutes. Their children go too. The supervisor runs it at the end of every run, and the launcher runs it whenever all lanes are idle. A dev server I start myself from a terminal has my shell as its parent, so the reaper leaves it alone.

My first version wasn't conservative, and that is part of the lesson. It also matched any process whose command line mentioned the Lab's folder, and on its first test it killed the shell that was running the test. Nothing else was hit. Still, a cleanup tool has the same power as the mess it cleans, so it should start from "spare everything" and add only the cases it can prove.

The skill also gained rules for process hygiene: every Playwright script closes its browsers in a `finally` block and has an overall timeout, audio is muted in every engine and not only Chromium, and a run that starts a dev server records its PID and stops it.

## The launcher's own small bugs

Some failures were just edges in shell and macOS:

- **Empty runs.** The skill stopped new products after October 15 and the launcher stopped them after October 16. For a day, launchd opened a fresh agent session every hour that read the store, found nothing allowed, and exited. Twelve of those used up the daily cap. The fix was one date in one place, plus a launcher that skips when nothing is queued.
- **`seq 1 0`.** On macOS, BSD `seq` counts down, so "zero lanes" would have opened two. The launcher now treats zero as zero.
- **A unit named `--help`.** A run called `lab-state unit-set --help`, and the state file gained a product called `--help`. Slugs are now validated.
- **A path with a full stop.** My second Codex login ended up in `~/.codex-b.`, because I copied the full stop from a sentence.
- **`launchctl submit` relaunches a job when it exits,** so a one-off test of Codex quietly ran it twice.

## The gate that over-fired

The look gate rejects a direction before any code exists if it resembles a shipped product. It saved days, until the portfolio grew. On October 15 it rejected twelve pitches in a row, each within half an hour. Each run wrote down its lesson, and they all said the same thing. A gate that fails everything has stopped telling you about the work.

**The fix** was partly human: I archived the products I didn't want, which shrank the comparison set, and for the last two days I chose the ideas myself.

## What the failures have in common

Most of the failures came in four shapes:

1. **An unchecked belief.** Scouts running, CORS blocking, the Mac awake. The fix was to measure before stating anything.
2. **A rule that existed only as prose.** Version ages, branch discipline, round caps. The fix was a script, a branch protection, or a denied permission, and the one rule left as prose was the one that failed at the end.
3. **The convenient path.** The over-broad credential, the fallback model, the fresh dependency. The fix was to make the convenient path the safe one, or to remove it.
4. **Nobody owning the cleanup.** Each run finished correctly, and the system as a whole still leaked. The fix was to give ending a run its own step, the reaper, instead of hoping each script closes what it opened.

The next post is about the last two days, when the question changed from "is it polished" to "is it worth making", and every product had to face a judge that wasn't another design review.
