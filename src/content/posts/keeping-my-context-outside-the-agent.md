---
title: "Keeping my context outside the agent"
description: "How I am using a personal knowledge base to carry context, interests, and long-term goals across different AI agents."
date: 2026-08-15
kind: "article"
lang: "en"
tags: ["ai", "agents", "knowledge-base", "local-first", "process"]
featured: false
draft: false
related: []
---

I did not build a personal knowledge base because I had identified a painful problem.

I came across [Andrej Karpathy's idea for an LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), thought it sounded interesting, and left it sitting in my backlog for a while.

When I eventually tried it, I found something much more useful than a place to store notes.

Karpathy's original idea is to use an LLM to incrementally compile raw sources into a persistent wiki. Instead of retrieving a few document fragments and rebuilding an answer from scratch every time, the agent maintains a collection of connected Markdown files. New sources update existing concepts, add links, and sometimes challenge what the wiki already says.

He describes the result as a "persistent, compounding artifact".

That idea of compounding is the part that stuck with me.

My knowledge base contains sources I want to preserve, but it also contains context about my projects, professional goals, interests, decisions, and the way I prefer to work. This gives an agent something more durable than the context of the current conversation.

Before this, I often had to explain the same background in different AI apps. This happened most often when I wanted to investigate a topic, think about my career, or ask for advice that depended on my actual situation.

I had also avoided enabling the memory features available in some AI apps. I was not comfortable handing over an open-ended collection of personal details and trusting an application to decide what should be remembered.

Keeping my own knowledge base does not solve every privacy concern. An agent can still access the information I choose to give it, and I cannot make strong claims about everything an AI provider may retain. What changes is that the durable copy lives in files I control. I can inspect it, edit it, and decide when an agent gets access.

The workflow is fairly small.

When I find an article, video, or other source I want to keep, I use an Apple Shortcut from my phone or computer. The shortcut creates an issue in the private GitHub repository that contains my knowledge base.

Later, an automation processes that queue. I currently run it with Codex, although the same job could be performed by Cursor or another agent with access to the repository.

The agent preserves the source, writes a summary, connects it to topics already in the wiki, and updates existing pages when the new material adds something useful.

```text
Interesting source
-> Apple Shortcut
-> Private GitHub issue
-> Agent processes the source
-> Existing knowledge gets updated
```

I can still add and process material manually, but the shortcut matters. Capturing something takes a few seconds, while the slower work of reading, organizing, and connecting it happens asynchronously.

This has made the system easy enough to keep using.

The results so far are not dramatic discoveries about myself. The knowledge base has not revealed some hidden truth that I would never have found alone. Its current value is continuity.

It has helped me compare projects before deciding where to spend time. I have used it during my job search, when reviewing my professional profile, and when thinking about which areas I should strengthen as an engineer.

It also helped with this post.

When I asked an agent what I could write about, it could look at the topics I had been collecting, the projects I had worked on, my professional situation, and the questions that had appeared repeatedly in the knowledge base. Without that context, the suggestions would probably have been much more generic.

This matters to me because I am still early in my career. My goals are not fixed, and my opinions about AI-assisted engineering are still developing while the tools themselves change quickly.

Longer-term goals and personal values can easily disappear from a normal chat. A question gets answered using the context that happened to fit inside that conversation. With the knowledge base available, the agent can consider previous decisions and ongoing interests before suggesting what I should learn, build, or investigate next.

I can also use the same folder with Codex or Cursor. The useful context does not depend on which product has the best memory feature this month. I can choose the agent that fits the task and give it access to the same underlying material.

There are obvious ways this could go wrong. Information can become stale. An agent can write a bad summary or connect two ideas too confidently. The structure could grow faster than its usefulness. A stored description of my goals could also preserve an older version of me for longer than it deserves.

I have not experienced those problems in a serious way yet. The system is still young, and I am sure there are limitations I have not noticed.

Even so, I would already recommend experimenting with this approach.

The main benefit takes time to appear. A single summary is only a summary. A folder full of disconnected notes is still a folder full of notes. The value grows when later sources update earlier ideas, and when future conversations can start with context accumulated over weeks or months.

What I value most is being able to inspect what the system knows about me, correct it, and carry that context to whichever agent I use next.

The agent can change. The context keeps adding up.
