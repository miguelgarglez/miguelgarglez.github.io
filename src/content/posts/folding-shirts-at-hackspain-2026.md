---
title: "Folding shirts at HackSpain"
description: "36 hours, one robotics brief from THEKER, and a simulated line that presses, folds and bags shirts. What we built and how the weekend went."
date: 2026-09-23
kind: "article"
lang: "en"
tags: ["hackathon", "robotics", "simulation", "dashboard"]
featured: true
draft: false
project: "xfold"
related: []
theme: "hackspain"
---

In September I spent a weekend at [HackSpain](https://hackspain.com), a 36-hour hackathon at UPM–ETSIT in Madrid with around 250 builders. I joined the THEKER Robotics track with three teammates, and we left with XFOLD: a simulated industrial line that presses, folds and bags shirts, plus a control room to watch it do that.

<ul class="hs-mosaic" aria-label="The weekend in numbers">
<li><strong>36 h</strong><span>of hacking</span></li>
<li><strong>250</strong><span>builders</span></li>
<li><strong>4</strong><span>of us on the team</span></li>
<li><strong>5 AM</strong><span>bedtime, twice</span></li>
</ul>

<figure class="hs-video">
<iframe src="https://www.youtube-nocookie.com/embed/arIuPMPokuY" title="XFOLD demo video, HackSpain '26" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<figcaption>The demo we recorded for the jury</figcaption>
</figure>

## The brief

THEKER's challenge was easy to say and hard to do: pick a task a person still does by hand on a factory floor and show that nobody has to do it anymore. End to end, repeatable, and ideally still working when things vary.

We picked shirts. Folding machines already exist, but someone still has to lay each garment flat, turn it the right way, fold it and bag it. Cloth is exactly the kind of variability classic automation struggles with: it wrinkles, slides, overlaps and never lands the same way twice.

## What we built

The first plan had two robot arms doing a Japanese-style fold. It didn't survive the first day. What we shipped is a line with no arms at all: the shirt arrives on a belt, gets straightened, pressed, folded by three flaps, pushed into a bag, sealed, tagged and dropped into a box.

None of it is an animation. The shirt is simulated fabric, the flaps actually push it, and the fold comes out square or it doesn't. Every run is recorded with its phases, timings, a product photo, a fold-quality score from a camera and a video.

It's three pieces talking to each other:

- **Simulation:** the line and a Python state machine that walks the shirt through each station.
- **Bridge:** a small Python API that keeps a journal of every run and streams it.
- **Dashboard:** a Next.js control room to launch runs, watch them live and replay them.

## What I focused on

We split the work early and kept checking in with each other all weekend, which is a big part of why it came together. I mostly lived between the simulation and the screen. I built the dashboard and the bridge: the run journal, REST for commands, server-sent events for the live feed, and the contract that let the physics side and the UI move in parallel. Later came saving experiments in SQLite, a live console and the XFOLD branding.

The contract is the thing I'd do again. With four people changing things at 3 a.m., having one page that said what an event looks like saved us more than once.

## Moving to Isaac Sim

MuJoCo was great on a laptop, but as the line grew the simulation got slow. THEKER gave us access to an NVIDIA GPU machine, so we ported the same line to Isaac Sim. The process code stayed the same, only the physics engine underneath changed, and a full cycle ended up running close to real time. The dashboard can drive either one.

## The nights

What I'll remember most isn't technical. My three teammates slept in their cars. Both nights we kept working at Embat's offices until 5 a.m.

The THEKER track was really strong, and we held our own. The jury mentioned us as a good project, which after a weekend like that felt like plenty.

The code is on [GitHub](https://github.com/rogarmu8/hackspain_2026_xfold) if you want to see how it's put together.
