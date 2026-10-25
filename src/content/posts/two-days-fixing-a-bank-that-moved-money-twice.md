---
title: "Two days fixing a bank that moved money twice"
description: "The t·Dots Banana Bank challenge: an AI banking assistant that duplicated transfers and moved money without asking. What I found, what I built on top, and how I worked with three coding agents reviewing each other."
date: 2026-10-13
kind: "article"
lang: "en"
tags: ["hackathon", "agents", "llm", "banking", "process"]
featured: true
draft: false
project: "banana-bank"
theme: "bananabank"
related: ["folding-shirts-at-hackspain-2026", "keeping-my-context-outside-the-agent"]
---

In October I did the [t·Dots](https://tdots.ai) technical challenge: a fictional bank called Banana Bank launches its AI assistant on Monday, and you join the team two days before. Customers can ask questions and send money through a chat agent, operators handle support cases. The brief had two parts. First, find out whether the app is ready and fix what you choose. Second, add one feature that makes the agent worth having. Everything goes in a single ZIP, with the complete AI sessions and a demo video.

I worked alone, October 10 and 11, and submitted on the night of the 11th. About 480 people took part in the online challenge, and my project made it into the top ten. I went through to the final and defended it in an interview with the organizers. I didn't finish in the top five, which were the ones with prizes, but getting that far in a field that size meant a lot to me. This is what came out of it.

<ul class="bb-accounts">
<li><span class="bb-account-label">Charged, before the fix</span><strong>€20.00</strong><span class="bb-account-note">for one €10.00 order</span></li>
<li><span class="bb-account-label">Tests</span><strong>13 → 78</strong><span class="bb-account-note">each fix failed first</span></li>
<li><span class="bb-account-label">Documents</span><strong>80 → 46</strong><span class="bb-account-note">435 → 88 chunks</span></li>
<li><span class="bb-account-label">AI sessions</span><strong>14</strong><span class="bb-account-note">Devin, Codex, Cursor</span></li>
</ul>

<figure>
<iframe src="https://www.youtube-nocookie.com/embed/PDGUyNVtR-8" title="Banana Bank, a motion reel of the t·Dots challenge" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<figcaption>The project in two and a half minutes, cut from real recordings of the app. The full 8:36 demo with subtitles went in the submission.</figcaption>
</figure>

## Part 1. The bank moved money twice

The starter ships with a simulated bank you must treat as external. You can't touch its code, only its HTTP API, and it comes with failure profiles: lost responses, slow responses, intermittent 5xx. The app is supposed to survive them. It didn't.

With the `lost-response` profile, a 10 euro transfer from Lucía to Bruno moved 20 euros. The bank had two completed operations. The app showed one. The cause was in the retry loop. After a timeout or a 5xx the app generated a fresh bank reference and tried again, so the bank's idempotency key (actor plus reference) never matched. Every retry was a new payment. The same thing happened with `slow-response` (the bank takes 2.6 s, the client cut off at 1.4 s) and, worse, with the `intermittent` profile the environment starts with.

The fix is one stable reference per intent, written atomically before the first call. On an ambiguous failure the app asks the bank `GET /v1/operations/:reference`. If the operation exists, it's done. If the bank says 404, retry with the same reference. If the app can't verify either way, the intent goes to `unknown`, never to `failed`, and gets resolved against the ledger later: on the next dashboard load, at the start of every chat turn, and whenever someone retries. While an equivalent transfer (same source, destination and amount) is unresolved, the app refuses to propose or confirm another one.

The second bug was the agent itself. `Send 5 euros to Bruno for coffee` executed in the same turn. No summary, no confirmation. The database had an `approvals` table, the API had a confirm endpoint, the UI had a proposals panel. Nobody was creating proposals.

I made one function the only door through which money moves. Without an approval it creates a proposal (source, destination, amount, concept, ten-minute expiry, one active proposal per intent) and returns a six-character code. Confirmation arrives either by clicking the card or by a message that contains only the code, optionally preceded by "confirm" or "yes". The server verifies both paths. The model's `confirm_transfer` tool cannot confirm anything on its own. A "yes" without the code is rejected. So is a negation that happens to mention the code. The approval is consumed atomically and once, the payload has to match, expiry is terminal, and the manual transfer form goes through the same door.

The third problem was softer. The agent wrote Python when a customer asked. The prompt literally said to fill gaps "with common banking practice and give an estimate". The retrieval chunker cut every 650 characters without looking at paragraphs, and the 80 documents in the corpus shared 24 identical boilerplate sentences, so many chunks had the same vector. Search didn't filter expired documents either. I rewrote the prompt to stay inside Banana Bank and answer only from retrieved evidence with `[document vN]` citations, rebuilt the chunker by paragraph with the title on every chunk, filtered by validity date, and rewrote the corpus itself: 80 documents became 46 distinct ones, 435 chunks became 88, and the shared sentences went from 24 to zero.

## Part 2. An operator copilot that checks the ledger

The starter's support view showed the operator the customer's last message and nothing else. The seed data had a case from Lucía: "Could someone check the dinner payment with Bruno?" The app had recorded that transfer as failed. The bank had completed it. The operator had no way to see that.

Now, opening a case shows the full conversation, every tool the agent called with arguments and results, the app's intents, and the bank's real operations for that customer. The app cross-checks each intent against the ledger by reference and flags discrepancies in plain words: the app says `failed`, the bank has a completed operation with this reference, amount and date. One button applies the reconciliation (it fixes the app's state, never touches the bank, and leaves an audited event). Another asks the model for a brief.

The brief is where I was most careful. The model gets a strict JSON schema: summary, verified facts, pending checks, discrepancies, suggested actions with citations to internal procedures, and a draft reply to the customer that may only contain verified facts. Anything in the prompt that came from the customer or from documents is marked as untrusted. Cited sources are validated against what retrieval actually returned. Invalid JSON is an error, not free text. The whole brief is stored for audit. And the case can't be closed while a reconcilable discrepancy remains. The reconciliation is computed in code; the model only writes around it.

The second half of Part 2 moved transfers into the conversation. The original flow made the model extract four fields from free text and call `transfer_money`. If one was missing it asked again and again, and sometimes invented an amount. I gave it a `draft_transfer` tool with optional fields. It validates whatever the customer already said against real accounts and contacts, then opens an editable transfer card right under its reply, prefilled, with the missing bits highlighted. The card is the same component as the Transfers tab and goes through draft, review (code and countdown) and done in place. Authorization doesn't change: the draft is only an event, and pressing Review calls the same gate as always. The cards are derived from intents and events, not UI state, so reopening a conversation shows each transfer in its real state next to the message that created it.

## How I worked

The method mattered as much as the fixes, because the brief asked for the complete AI sessions and I wanted them to be worth reading.

Every bug was reproduced first, over the API or in the browser, and the proof saved under `evidencias/antes/`. Every fix got an automated test that failed before and passed after, with the commits in that order, then the same reproduction repeated under `evidencias/despues/`. The starter had 13 tests. The submission has 78.

I used three agents with different jobs. Devin was the main agent, with a subagent for implementation. Codex (GPT) and Cursor (Grok) were read-only reviewers, run in two rounds over the diff. They found real defects I'd have shipped otherwise: a confirmation path that depended on the model's judgement, an `unknown` state that could duplicate a payment when reproposed, an expiry that reactivated approvals, an unreadable response body treated as a rejection, a brief filed under the wrong case. All of them are fixed and covered by tests. The review prompts and full reports are in the submission.

Every UI block has a Playwright script that drives the flow, checks DOM, URL and database, and saves its screenshots. A refactor of the API handler (270 lines of `if` into an 11-line dispatcher over a route table), the design tokens and the 1,200-line page component was verified with pixel comparison: eight 1440 px captures before and after, zero pixels different.

For the sessions I wrote an exporter that reads the local databases of each tool and dumps everything verbatim: 14 sessions, 7 from Devin, 4 from Codex, 3 from Cursor, including subagent branches. Then a static viewer that opens offline and shows the chain of agents as a timeline, each session as a graph with lanes for main, subagent and branches, and every message, call and result. I'd rather a reviewer could see where the ideas came from than take my word for it.

## What I'd point at

If you only look at one thing, look at the authorization gate and the `unknown` state. Both are small. Both are the difference between a demo and something you could put in front of a customer on Monday. The rest, the copilot, the card in the chat, the real routes, the banana that spins while it waits, is what you get to build once the money can't move twice.

The code is on [GitHub](https://github.com/miguelgarglez/banana-bank-tdots-challenge).
