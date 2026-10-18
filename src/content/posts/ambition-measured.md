---
title: "Ambition, measured"
description: "The last two days of the Agent Lab: fewer ideas, chosen by me, and a real outside judge for each one, including an agent that found, paid for, and used a service on its own."
date: 2026-11-02
kind: "article"
lang: "en"
tags: ["ai", "agents", "x402", "search", "process"]
featured: false
draft: false
series: "agent-lab"
seriesOrder: 4
related: ["running-an-agent-product-studio-on-one-mac", "taste-is-not-a-score", "what-broke-and-what-each-break-taught"]
---

By the second Friday the Lab had shipped a lot and I had kept little. The look gate was rejecting new ideas faster than runs could produce them, and most of what had passed felt like toys. I said so: "Hasta ahora solo he percibido cositas de juguete la verdad, hay que dar una vuelta". Then I sent the coordinator a post I had just read, Felix Rieseberg's [How to be more ambitious: A tutorial for humans with models](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/).

The last two days ran on that post. This one describes what changed and what came out of it.

## Four kinds of ambition

Rieseberg sorts ambition into four kinds. Speed means doing the same work faster. **Altitude** means aiming at the outcome behind the task, the goal beyond the goal. **Depth** means working the way a field-leading expert would: starting from the rawest material and using the methods and tools the best people use. **Range** means pulling in fields the task doesn't seem to need. His most practical advice was about checking the work: don't let the model judge itself, and use an outside judge, ideally one a script can run.

Reading the Lab's first ten days against that list was uncomfortable. The products had plenty of range: radio and geodesy, museum archives and CLIP, demoscene and the web. They had very little altitude, almost no depth, and no outside judge at all. Every product was judged by a design review, which is another model looking at screenshots. That measures polish, as the [second post](/posts/taste-is-not-a-score/) argues.

So for the last 33% of my quota I changed three things:

1. **I chose the work.** No more scouting. I picked two existing products to deepen and one new project.
2. **Every brief answered Rieseberg's questions.** What would a top professional in this field do here? What is the rawest material they would start from? Which methods and tools would they use? What, other than the model, would show the result is right?
3. **Every product needed an outside judge,** with a pass criterion written before the work started.

I also cut the slack: a hard budget of three design rounds plus a confirmation, builds split across parallel subagents, and three lanes at once instead of one.

## traza: judged on my own sessions

traza draws agent sessions as a map. Its first version parsed my real hackathon sessions correctly, and was still hard to use: the replay rushed through everything, and many steps were labelled "message".

**Altitude:** the goal is not drawing a session. It is helping a person understand and audit what a team of agents did, at their own pace.

**Depth:** borrow from the tools that already solve this for other kinds of traces, such as LangSmith, Arize Phoenix and Chrome's performance panel. That meant steps named by what they did (`edit src/x.ts`, `npm test → 3 failed`), a replay that pauses on each turn, an inspector with the reasoning, the tool arguments, the output and the diff, a waterfall of real durations, and filters by agent and tool.

**Range:** the identity of trenza, an earlier attempt I had preferred, with its woven threads in place of metro lines.

**The judge:** my own export from the hackathon, 14 sessions across Devin, Codex and Cursor. The run wrote five concrete questions about it, like "where was the double-transfer bug reproduced" and "what did the Codex reviewer flag", and had to show each answered through the interface in under a minute. It passed all five, with 2,795 tool calls loaded and 17 secrets hidden from the display.

<figure>
<img src="/images/posts/agent-lab/trenza-ride.jpg" alt="trenza: agent sessions drawn as woven threads on a dark loom, with a shuttle moving along one thread and a step inspector open." loading="lazy" />
<figcaption>trenza, the second round of traza, replaying a session as a shuttle along its thread.</figcaption>
</figure>

The design gate was less impressed: a 6 on first impression and a mean of 7.25 on the look gate. It parked for my call, and I shipped it anyway, because the judge that mattered had passed. It lives at [traza-sand.vercel.app](https://traza-sand.vercel.app).

## mellizo: is the twin really a twin?

mellizo hangs your photo on a museum wall next to its closest artwork. I liked the style and doubted the resemblance. The corpus was also small, at 22,000 works.

**Depth:** start from the museums' raw open-access collections: the Met, the Art Institute of Chicago, the National Gallery of Art and Cleveland. Keep only public-domain pictorial works with usable images, measured first so that no strips get in. Then fit it all into a free Supabase database, which meant storing vectors as `halfvec(512)` behind an HNSW index, sized before loading.

**Explain the match:** show why the twin is a twin, from measurements and never from invention. Each result carries a sentence and three lenses you can turn on: the five dominant colours of each side with the shared ones ringed, the saliency centroid where the eye lands, and pose skeletons when there is a figure. When nothing matches strongly, the sentence says so.

**The judge:** a blind comparison. The run chose 20 varied photos, and a model from another family picked which candidate looked more like each photo, from images alone. That test is what changed the plan. The finer CLIP grid, patch16, ranked the judge's choice above the coarser model's top pick in all 20 cases. So the whole corpus was re-embedded at patch16, about five hours on the M4, and 105,291 works went onto the wall. Your photo is still embedded in your browser and never leaves the device. Only its vector does.

## almoneda: selling to agents

The last project came from an idea of mine, framed as a question: how do you sell to agents, and bill them automatically?

The protocol that answers the billing half is [x402](https://docs.x402.org). It revives the HTTP 402 "Payment Required" status code. A client asks for a resource, the server answers 402 with a price, the client signs a stablecoin payment for exactly that amount and retries, and a facilitator verifies and settles it. There are no accounts and no API keys: the credential is the payment. Coinbase runs a discovery index called the Bazaar, and when I looked, what agents could buy was mostly crypto and finance data.

So the product became an image service for agents. Agents that write posts and slides need pictures they can legally use, and today they invent them or grab whatever they find. [almoneda](https://almoneda-jet.vercel.app) sells public-domain artworks from mellizo's corpus, for a cent or two per search. Each result comes back with machine-readable provenance: museum, accession number, rights statement, and the URL that proves it. The payments land in a wallet I created for this, on testnet only.

<figure>
<img src="/images/posts/agent-lab/almoneda-floor.jpg" alt="almoneda's public floor: a bidding console on the left, and on the right the last lot sold, A Rocky Seacoast in a Storm, above a ledger of settled testnet sales with transaction links." loading="lazy" />
<figcaption>almoneda's floor. Every row is a settled testnet payment. The last lot sold for "a storm at sea" is a storm at sea.</figcaption>
</figure>

**The first judge failed it, usefully.** In the first round, a fresh agent with no prior knowledge discovered the service, paid over x402 on its own, and wrote the post. The payment flow worked perfectly. But it had asked for "a storm at sea" and received "The Judgment of Solomon". The payments were right and the product was wrong.

**Round two put relevance first, and measured it.** The run built a benchmark before changing anything: 50 queries an agent would plausibly send, 10 of them deliberately tricky, and 1,039 image judgments from a model of another family. It then tried the obvious improvements. Hybrid full-text search fused with the vectors scored lower, P@5 0.888 against 0.916. An offline sweep of 1,344 fusion settings found nothing better either. So the shipped ordering stayed as it was, at **P@5 0.916 and nDCG@10 0.813**, and that decision rested on a measurement rather than a feeling. Two things were added: a calibrated relevance score with a `why`, and a strict mode that declines to charge when nothing matches well.

**The second judge passed.** A fresh Codex agent was given a funded testnet wallet and one task: illustrate two short posts with public-domain art and credit it correctly. It found the service through `/.well-known/x402`, made 7 paid calls, and delivered both posts. A second model family checked whether each image fitted its paragraph: 5 of 6 did. That was the whole loop I had asked for, from discovery to payment to use, with no human in it.

## What the last two days showed

The last two days produced more of what I valued than the previous nine, and with less waste. Some reasons:

- **The ideas were mine.** The Lab was good at executing and poor at choosing. Autonomous picking had optimised for passing gates.
- **The judges were real.** My sessions, a blind visual comparison, and an agent spending money. Each one could fail the work in a way a design review couldn't, and two did.
- **Depth came from the raw material.** Museum dumps instead of a sample, a benchmark instead of a hunch, my own traces instead of synthetic ones.
- **The budget forced decisions.** With three rounds and a park state, no product spent a day polishing.

The last post closes the series with the full numbers, the products I kept, and what I'd do differently.
