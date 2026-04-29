# cv-chat Renewal Decision Log

This file records the decisions closed so far for the radical redesign of `cv-chat`.

## Closed Decisions

- Concept: `Editorial Technical Dossier + AI Case File`.
- Palette: `Charcoal / Warm Paper / Rust`.
- Typography: keep system fonts for now; strengthen hierarchy through scale, weight, and spacing.
- Background: subtle depth, not a flat plane.
- Hero: very simple; oversized name, minimal supporting copy, and a scroll cue only.
- Navbar identity: `/miguelgarglez`.
- Navbar links: `About`, `Experience`, `Skills`, `Agent`, `Contact`.
- Agent access: click to open the drawer, with `Cmd+K` / `Ctrl+K` as the keyboard shortcut.
- Agent UI: lateral drawer on desktop, documented and dossier-like rather than chatty.
- Intro/boot: skip for now.
- Hero ASCII: present in the hero as subtle background texture plus one small visible fragment.
- ASCII style: abstract, technical, non-literal.
- ASCII motion: soft entrance with minimal drift.
- Motion overall: restrained and premium.
- About: brief positioning section.
- Experience: dossier-style blocks, not a plain timeline.
- Skills: functional and clean.
- Skills model: keep expandable vertical cards, but frame categories as `Frontend Platform`, `Backend & Data Foundations`, `AI & Developer Tooling`, and `Exploratory Engineering`.
- Skills honesty: frontend is the strongest professional area; backend/data are solid foundations; mobile/native is exploratory tinkering rather than a primary specialty.
- Current experience: include the MCP server built to support component-library consumers with context, integration patterns, troubleshooting, and migrations.
- Credentials & Learning: independent supporting section after Skills, covering only formal education and professional learning.
- Credentials academic rows: keep compact years and keep Aalto University as its own row.
- Credentials professional learning rows: show all items, link all available credentials, and omit years so the list reads as curated evidence rather than a mini chronology.
- Contact: elegant exit rather than a loud CTA.
- Scroll motion: very subtle reveals.
- Agent section order: placed just before Contact.

## Notes

- The drawer remains accessible before the `Agent` section appears in the scroll.
- This log should stay aligned with the implementation-oriented plans in `docs/cv-chat-renewal/04-radical-art-direction.md` through `07-scroll-experience-dossier-codex-plan.md`.
