# Personal Site

This context describes the language used for Miguel's personal site and the remote Codex workflow around it.

## Language

**Personal Site**:
Miguel's public web presence, including the home, professional CV experience, chat entrypoints, and supporting deployment surfaces.
_Avoid_: portfolio, blog, app

**Home**:
The root Astro experience that acts as the main directory for projects, people, and ideas.
_Avoid_: landing page, homepage app

**Project Directory**:
The structured collection of projects shown from the Home.
_Avoid_: portfolio grid, project list

**CV Chat**:
The independent Astro experience under `cv-chat/` that presents Miguel's professional profile and chat interface.
_Avoid_: chatbot site, resume page

**Chat Worker**:
The Cloudflare Worker that serves the chat endpoint used by CV Chat.
_Avoid_: backend, API server

**Profile Knowledge**:
The structured facts, memories, projects, and profile content used to ground chat answers about Miguel.
_Avoid_: RAG database, prompt data

**Professional Fact**:
A factual claim about Miguel's role, experience, education, certifications, projects, skills, or contact details.
_Avoid_: profile copy, marketing claim

**Professional Experience Update**:
A change that updates how Miguel's work history, current role, skills, education, certifications, or profile positioning is represented.
_Avoid_: copy tweak, profile refresh

**Product Change**:
A code change that alters behavior, structure, workflow, UI interaction, or functionality of the Personal Site.
_Avoid_: task, implementation, code tweak

**Remote Codex Environment**:
The full-access cloud environment used by Codex to work asynchronously on this repository.
_Avoid_: CI, runner, agent machine

**External Project System**:
A connected service or data source used by a project linked from the Personal Site but not directly used by this repository.
_Avoid_: app dependency, repo service

**Visual Evidence**:
Screenshots and route/viewport notes produced by Codex when verifying UI changes.
_Avoid_: visual test, design review

**Live Chat Test**:
A test that sends a real request through the Chat Worker to the configured LLM provider.
_Avoid_: chat test, agent test

**Post**:
A future authored article or note published from the Personal Site once the Home supports blog-style content.
_Avoid_: project, page, update

## Relationships

- The **Personal Site** includes the **Home**, **CV Chat**, and **Chat Worker**.
- The **Home** exposes the **Project Directory**.
- **CV Chat** uses the **Chat Worker** for chat responses.
- The **Chat Worker** uses **Profile Knowledge** to ground answers.
- **Profile Knowledge** should stay aligned with **Professional Facts** visible in **CV Chat**.
- A **Product Change** can affect the **Home**, **CV Chat**, **Chat Worker**, workflows, or supporting documentation.
- A **Professional Experience Update** may change **CV Chat**, **Profile Knowledge**, and deterministic profile-agent tests together.
- A **Post** belongs to the **Personal Site** once publishing support exists, but it is distinct from a **Project Directory** entry.
- The **Remote Codex Environment** changes the **Personal Site** through branches and PRs.
- An **External Project System** is not part of the **Personal Site** unless a task explicitly brings it into scope.
- **Visual Evidence** supports review of UI changes made by the **Remote Codex Environment**.
- A **Live Chat Test** verifies production-like chat integration beyond deterministic **Profile Knowledge** checks.

## Example dialogue

> **Dev:** "If I update Miguel's current role in **CV Chat**, should I also update **Profile Knowledge**?"
> **Domain expert:** "Yes - **CV Chat** is the visible source, and **Profile Knowledge** should stay aligned so the **Chat Worker** answers consistently."

## Flagged ambiguities

- "Full access" means full operational access in the **Remote Codex Environment**, not permission to perform destructive actions without explicit confirmation.
- "Visual verification" means browser-based review with **Visual Evidence**, not just a successful build.
- "Chat test" should distinguish deterministic **Profile Knowledge** checks from a **Live Chat Test** that calls the real provider.
- "Improve the profile" does not mean inventing or materially changing **Professional Facts** without a clear source or user confirmation.
- "Professional update" means a **Professional Experience Update**, not just a visual copy edit.
- "Programming task" usually means a **Product Change** and should still follow branch, PR, validation, and visual evidence rules when applicable.
- "Post" is reserved for future authored content, not current **Project Directory** entries.
- "Supabase" currently refers to an **External Project System**, not a direct dependency of the **Personal Site**.
- "Vercel" currently refers to a secondary fallback surface for `chat-backup-vercel/`, not the primary deployment path.
