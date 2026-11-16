---
title: "What the next agent will copy"
description: "Lauren Tan's pstack and Matt Pocock's skills share a premise. Agree on how the software should behave, then give the next agent a way to check it."
date: 2026-11-16
kind: "article"
lang: "en"
tags: ["ai", "agents", "testing", "process"]
featured: false
draft: false
---

The fix I remember from Lauren Tan's AI Engineer talk is a pair of directories. At Cursor, she'd seen coding agents import Electron's main-process code into the renderer and make the interface stutter. In Grok Bot, the team gave the main process and the renderer separate directories and added checks to stop imports crossing between them. The folder names tell an agent where the code belongs. If it gets that wrong, the import fails a check. [Tan's Electron example at 6:10.](https://www.youtube.com/watch?v=O_zcc6Xl12g&t=370s)

<figure>
<img src="/images/posts/what-the-next-agent-will-copy/electron-directory-boundary.webp" alt="Tan's Dune diagram shows electron-renderer and electron-main in separate boxes. The direct import arrow is crossed out. Both directories point to shared for common types." width="1472" height="832" decoding="async" />
<figcaption>Dune puts common types in <code>shared/</code>, which both processes can import. <a href="https://www.youtube.com/watch?v=O_zcc6Xl12g&amp;t=393s">Lauren Tan at AI Engineer, 6:33</a>.</figcaption>
</figure>

I've been looking at two collections of skills through that example. Tan, who goes by [@poteto](https://x.com/poteto), made pstack. Matt Pocock ([@mattpocockuk](https://x.com/mattpocockuk)) publishes his own set of skills for working with coding agents. Both draw on engineering practices that predate agents. What makes them interesting together is what happens after you use them. A discussion can leave behind a definition of what the software should do. A fix can leave behind a test that tells the next agent when that behaviour has changed.

## The nearest example is part of the instructions

Tan describes another problem from Cursor. Agents were adding timers to work around timing problems where VS Code's imperative code met React. A timer solved the immediate problem. Sometimes the agent left a comment explaining why it was needed. The next agent could read that comment, see the code working, and use the same approach in a second place. Eventually there were enough timers being created and destroyed that, according to Tan, garbage collection caused noticeable pauses. [The timer example at 7:22.](https://www.youtube.com/watch?v=O_zcc6Xl12g&t=442s)

That changes the cost of leaving a workaround in the code. A person who remembers the original decision might know it was temporary. An agent opening the file months later sees code that was accepted. The more copies it finds, the more the workaround looks like a convention.

Pstack's `/correct` treats a recurring mistake as a reason to change the repository. Start by seeing whether you can remove the bad path altogether, for example by exposing one supported interface and hiding the internals. If the choice still exists, a type or lint rule may be able to reject it. A behaviour that depends on execution needs a test. The skill also asks you to run each new check against a real past mistake. You learn something when the old change fails for the reason you expected. [Pstack's `/correct` skill.](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md)

## The test starts with a product decision

Tan mentions modelling notifications across devices. Take a simple case inspired by that example. Someone dismisses a notification on their laptop while their phone is offline. When the phone reconnects, should it clear that one notification or everything from the same conversation? The implementation depends on which of those the product means by *dismiss*. [Tan's notification example at 10:50.](https://www.youtube.com/watch?v=O_zcc6Xl12g&t=650s)

Pocock's `grill-with-docs` is built for questions like that. It gets the agent to work through the design with you and gives the resulting definitions a place in the project's glossary. Decisions worth recording can go in an architecture decision record. That's the practical side of ubiquitous language from domain-driven design. If people use *dismiss* to mean one thing in a conversation, another in the code and a third in a test, each new change starts by guessing which meaning applies. [Pocock's `grill-with-docs` skill.](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)

Suppose you agree that dismissing one notification should leave a newer one in the same conversation alone. In Pocock's `/tdd` workflow, you'd agree on the public interface to test and write one case that fails before implementing the behaviour. With the phone offline, dismiss the older notification on the laptop and let a new one arrive. Reconnect the phone and check that it shows only the new notification. The test is about what the phone sees, so you can change how sync works internally and keep the same assertion. [Pocock's `/tdd` skill.](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md)

This is also why Pocock's design skills care about putting substantial behaviour behind a small interface. If every caller has to work out which records to update and in what order, each caller can get a different answer. Give the notification module ownership of that decision and there's one place to make it work. The same interface gives the agent a way to test the behaviour without reaching into the implementation. [Pocock's `codebase-design` skill.](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)

## What would count as evidence?

Tan's team gives its agents a feature map written in the language of the app, plus a CLI that can drive the running product. An agent can use the map to find the intended flow, run it and leave a screenshot or recording for review. What counts as evidence depends on the change. To check that a settings panel opens, a screenshot can show the resulting state. For a notification that should stay dismissed after reconnect, you need to see what happens on both sides of that reconnect. A screenshot from before it tells you very little. [Runtime verification at 9:40.](https://www.youtube.com/watch?v=O_zcc6Xl12g&t=580s)

The team also uses TLA+ to model flows like these. A model can check whether any order of dismissal, arrival and reconnection brings the old notification back under the rules you've specified. A test of the running app can replay a particular sequence against the implementation. If an agent reports that it verified notifications, I'd want to know which events it checked and where it checked them. [Formal verification at 10:50.](https://www.youtube.com/watch?v=O_zcc6Xl12g&t=650s)

## What the PR count leaves out

Tan reports that the Grok Bot team shipped about 11,000 pull requests to production in a month and reverted roughly 0.5% of them. She also says that startup, typing and switching chats got faster compared with launch. I'd pay more attention to those measurements of the app than to the number of PRs. A revert rate counts the changes a team rolled back. A slow chat switch affects the user whether or not anyone reverts the PR that caused it. [The team's results at 13:32.](https://www.youtube.com/watch?v=O_zcc6Xl12g&t=812s)

The line I'd watch for in a review is "we already fixed this once". I'd go looking for what the previous fix left behind. Maybe the agent had two examples to copy and picked the obsolete one. Maybe there was a perfectly good test for the behaviour, but nobody ran it. Or maybe the decision was only ever written down in a closed pull request. Each of those is something you can fix before asking the next agent to be more careful.

<figure>
<iframe src="https://www.youtube-nocookie.com/embed/O_zcc6Xl12g" title="All Code Is Slop (Except Mine), Lauren Tan at AI Engineer" width="560" height="315" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<figcaption>Lauren Tan's full talk, <a href="https://www.youtube.com/watch?v=O_zcc6Xl12g">All Code Is Slop (Except Mine)</a>.</figcaption>
</figure>
