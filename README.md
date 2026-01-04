<div align="center">

# 👋 Hello, it is Miguel

Welcome to my GitHub Pages repository!

</div>

## 🌐 Personal Website

<div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0;">

Visit my personal website: **[miguelgarglez.github.io/personal_site](https://miguelgarglez.github.io/personal_site)**

Built with [**Astro**](https://astro.build/) - a modern web framework for building fast, content-focused websites.

</div>

## 📁 Projects

<div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0;">

### **personal_site**
My personal website showcasing my CV.

**Status:** ✅ Active  
**Technologies:** ![Astro](https://img.shields.io/badge/-Astro-FF5D01?style=flat-square&logo=astro&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

</div>

<div style="border: 1px solid #d0d7de; border-radius: 6px; padding: 16px; margin: 16px 0;">

### **chat-worker**
Cloudflare Worker powering the chat endpoint for the site.

**Status:** ✅ Active  
**Technologies:** ![Cloudflare Workers](https://img.shields.io/badge/-Cloudflare%20Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

</div>

## 🚀 CI/CD

- GitHub Pages deploys on every push to `main`.
- The Cloudflare Worker deploys on pushes that include changes under `chat-worker/`.
- Manual runs from the Actions tab can deploy the worker even without changes.
- Required secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Release automation uses Release Please (`.github/workflows/release-please.yml`) to open a PR on pushes to `main`, then creates tags/releases when that PR is merged.
- To allow the workflow to open PRs, enable "Read and write permissions" and "Allow GitHub Actions to create and approve pull requests" in repo Actions settings.
