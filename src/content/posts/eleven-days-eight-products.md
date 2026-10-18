---
title: "Eleven days, eight products"
description: "The Agent Lab's final numbers: 37 products started, 8 kept, 58 unattended runs, about $5.60 of model spend, and what still needed a person."
date: 2026-11-09
kind: "article"
lang: "en"
tags: ["ai", "agents", "process", "retrospective"]
featured: false
draft: false
series: "agent-lab"
seriesOrder: 5
related: ["running-an-agent-product-studio-on-one-mac", "taste-is-not-a-score", "what-broke-and-what-each-break-taught", "ambition-measured"]
---

From October 7 to October 18, my Mac ran a small product studio made of coding agents. This series covered how it [ran](/posts/running-an-agent-product-studio-on-one-mac/), how it [judged taste](/posts/taste-is-not-a-score/), how it [broke](/posts/what-broke-and-what-each-break-taught/), and how the [last two days](/posts/ambition-measured/) changed it. This last post closes the accounts: what it produced, what it cost, what I kept, and what I'd do differently.

## The numbers

| | |
| --- | --- |
| Products started | 37 |
| Shipped and kept | **8** |
| Shipped, then discarded by me | 6 |
| Abandoned by the quality gates | 23, 12 of them on a single day |
| Redo rounds on shipped products | 13 |
| Unattended runs | 58 |
| Agent run time | about 210 hours, median 1.7 hours per run |
| Decisions logged | 277 |
| Processes left running at the close | 166, about 1.1 GB, including a headless Firefox playing music for four days |
| Model spend | about $5.60 |
| Hosting | $0 |

The money is almost a rounding error. $3.29 went through Vercel's AI Gateway, nearly all of it on one deliberate job, the relevance labels for almoneda's search benchmark. $2.30 went on one unapproved fallback to OpenCode before I banned it. The $50 of OpenAI credit I had set aside went unused, because the products leaned on open data and models running in the browser. Hosting stayed on free tiers: Vercel Hobby, Supabase and Cloudflare. The only payments in the system were testnet money for an agent-commerce demo.

The real budget was my Devin Max quota. It went from 95% on the first evening to a weekly reset on day five, and to 27% with two days left. A coordinator chat, my own hackathon sessions, and up to three parallel lanes all drew on it. Quota, not ideas, was the limit I planned around.

## What I kept

These are in my order, with what decided each one.

1. **[antipoda-fm](https://antipoda-fm.vercel.app)** finds the radio station playing on the exact opposite side of the Earth. It was the pilot and four redos later still my favourite: live data, real geodesy, a 3D globe, and a sense of wonder that survives the second visit.
2. **[mellizo](https://mellizo.vercel.app)** hangs your photo next to its twin among 105,291 public-domain artworks, with lenses that show why they match. I stayed for the style. It earned its place once it went deep.
3. **[traza](https://traza-sand.vercel.app)**, now **trenza**, weaves agent sessions into threads you can replay and audit. It passed the test I cared about, answering real questions about my own sessions, and I preferred its woven look to the first version's metro map.
4. **[greets](https://greets-theta.vercel.app)** writes a demoscene cracktro for any name, and since its second round it lets you edit it, style it and export it as a GIF or video. The aesthetic is what won me over.
5. **[nullius](https://nullius-three.vercel.app)** is an endless engraved sea chart where the first visitor to reach a pennant names it forever. It is collective, persistent play.
6. **[yesca](https://yesca-theta.vercel.app)** and **[maqueta](https://maqueta-live.vercel.app)** stay for their engineering: a GPU wildfire on real terrain under tonight's wind, and Finland's live trains on a wooden layout. I kept them, though I wasn't very interested in them.
7. **[almoneda](https://almoneda-jet.vercel.app)**, the last project, sells public-domain art to agents over x402. An agent found it, paid for it, and used it on its own.

Everything else is archived and private, with its work kept on a branch.

## What still needed a person

The Lab ran for nights without me. What it couldn't do alone falls into five things.

- **Choosing what to make.** Autonomous scouting produced ideas that passed gates. The ideas I valued came when I chose them, or when I said which ones were toys.
- **Judging taste above the floor.** The design gate kept broken corners out. Only my review could say that ten products with good scores were mostly forgettable.
- **Deciding near misses.** The `parked` state existed because a score of 7.25 sometimes deserved to ship, and that call was mine to make.
- **Granting access.** Every key, wallet, login and deletion went through me, through hidden dialogs or commands I ran myself. Deleting six Vercel projects was blocked for the agents on purpose, so I typed the command.
- **Publishing.** No post, thread or launch went out without me. That includes this series.

Some things needed me less than I expected. The agents wrote and ran their own tests, reproduced bugs in three browser engines, reviewed each other across model families, recovered from outages, and cleaned up their own messes when the evidence was in front of them. The coordinator caught most of its own mistakes once it was told to check before reporting.

## What I'd do differently

1. **Choose the ideas myself from the start,** and let the system do what it was best at: executing, verifying, and documenting.
2. **Write the outside judge into every brief from day one,** with the pass criterion fixed before work starts. It caught more than the design gate did.
3. **Measure depth, not only polish.** Every product needs a second layer, made of controls, export, and a reason to come back, and someone has to actually use it for ten minutes.
4. **Put a script behind every budget.** The round cap that stayed a sentence was the one that failed.
5. **Make ending a run a step of its own.** Every run exited cleanly and the machine still filled up with servers and browsers. Cleanup belongs to the system, not to each script's good manners.
6. **Give agents scoped credentials only.** The worst incident happened because a convenient login was already within reach.
7. **Verify the infrastructure I'm relying on.** For eleven days I believed the Mac stayed awake with the lid closed. The power log said otherwise, and resilience had covered for it.
8. **Fewer, deeper products.** Five things I'd show beat thirty I wouldn't.

## What stays

The system is still installed, minus the scheduler. The `lab-build` skill can run unattended again, `lab-focus` applies the same method to a single project with me in the chat, and `lab-sessions-export` collects every agent's sessions from a project so trenza can draw them. A runbook covers bringing the studio back, along with the honest version of keeping a Mac awake.

The main thing I learned is about where my time goes. The agents turned my eleven days into 210 hours of work. The useful part of my time went into deciding what was worth making and what good meant. Most of the rest of this series records the cases where I didn't decide those things clearly enough.
