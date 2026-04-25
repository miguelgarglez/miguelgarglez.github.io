<div align="center">

# 👋 Hello, it is Miguel

Welcome to my GitHub Pages repository!

</div>

## 🌐 Personal site

The root site is an Astro app that works as my personal home: a directory of projects, people, and ideas.

```bash
npm install
npm run dev
npm run build
```

Content lives in:

- `src/data/projects.ts`
- `src/data/people.ts`

## 🌐 cv-chat

<div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0;">

Visit my digital CV: **[miguelgarglez.github.io/cv-chat](https://miguelgarglez.github.io/cv-chat)**

Built with [**Astro**](https://astro.build/) - a modern web framework for building fast, content-focused websites.

</div>

## Local Development

Both the root site and `cv-chat` use `npm` as the package manager. They are independent Astro projects.

```bash
# Root personal site
npm install
npm run dev

# cv-chat
cd cv-chat
npm install
npm run dev
```

## 📁 Projects

<div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0;">

### **cv-chat**
My digital CV with chat.

**Status:** ✅ Active  
**Technologies:** ![Astro](https://img.shields.io/badge/-Astro-FF5D01?style=flat-square&logo=astro&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

</div>

<div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0;">

### **momentum**
Native macOS productivity app to help sustain execution rhythm and focus.

**Links:** [Live landing](https://momentum-macos.vercel.app) · [GitHub repository](https://github.com/miguelgarglez/momentum)  
**Status:** ✅ Active  
**Technologies:** ![Swift](https://img.shields.io/badge/-Swift-FA7343?style=flat-square&logo=swift&logoColor=white) ![SwiftUI](https://img.shields.io/badge/-SwiftUI-0A84FF?style=flat-square&logo=swift&logoColor=white) ![macOS](https://img.shields.io/badge/-macOS-000000?style=flat-square&logo=apple&logoColor=white) ![Astro](https://img.shields.io/badge/-Astro-FF5D01?style=flat-square&logo=astro&logoColor=white)

</div>

<div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0;">

### **wellstudio-platform**
Modular Next.js platform for a boutique wellness studio, covering members, bookings, plans, payments, and studio operations.

**Links:** [GitHub repository](https://github.com/miguelgarglez/wellstudio-platform)<br>
**Status:** ✅ Active<br>
**Technologies:** ![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white) ![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)

</div>

<div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0;">

### **chat-worker**
Cloudflare Worker powering the chat endpoint for the site.

**Status:** ✅ Active  
**Technologies:** ![Cloudflare Workers](https://img.shields.io/badge/-Cloudflare%20Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

</div>

## 💬 Chat streaming notes

- The worker streams AI SDK UI message events (SSE). Use `start`, `text-start`, `text-delta`, `text-end`, `finish`, and `[DONE]`.
- Errors must be sent as `{ "type": "error", "errorText": "..." }` for the UI to surface them.
- The worker avoids creating empty assistant messages; if the upstream sends zero bytes, it emits a streaming error instead.

## 🧪 Frontend failover testing

- We test failover behavior in a real browser with Playwright by intercepting the primary chat request at runtime.
- This allows deterministic simulation of `timeout`, `429`, `503`, and `504` without taking down real services.
- Full guide: [`docs/playwright-failover-testing.md`](docs/playwright-failover-testing.md)

## 🚀 CI/CD

- GitHub Pages builds the root Astro site and `cv-chat` on every relevant push to `main`.
- The Cloudflare Worker deploys on pushes that include changes under `chat-worker/`.
- Manual runs from the Actions tab can deploy the worker even without changes.
- Required secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Release automation uses Release Please (`.github/workflows/release-please.yml`) to open a PR on pushes to `main`, then creates tags/releases when that PR is merged.
- To allow the workflow to open PRs, enable "Read and write permissions" and "Allow GitHub Actions to create and approve pull requests" in repo Actions settings.
