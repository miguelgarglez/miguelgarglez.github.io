# Codex Remote Setup

This repo is optimized for delegated Codex tasks, whether they are launched from Codex Cloud, the Codex app in Cloud mode, the IDE extension, the CLI, or GitHub delegation. The goal is reproducibility first: every remote task should be able to install dependencies, build the relevant app, run focused tests, inspect relevant state, and open a PR without relying on local-only context.

## Repository Shape

- Root Astro app: personal home and project directory.
- `cv-chat/`: independent Astro app for the CV/chat frontend.
- `chat-worker/`: Cloudflare Worker that serves the chat endpoint.
- GitHub Actions:
  - `.github/workflows/deploy.yml` builds GitHub Pages and deploys the Worker.
  - `.github/workflows/release-please.yml` manages release PRs.

Primary remote task families:

- Product and engineering changes: implement or adjust features, refactor scoped code, fix bugs, improve UI behavior, update workflows, and verify with focused tests plus full repo verification.
- Visual/UI iteration: retouch layouts, components, interactions, responsiveness, and design details with required browser screenshots.
- Professional experience updates: update visible `cv-chat` profile content, keep Profile Knowledge aligned, adjust deterministic profile-agent tests when needed, and provide Visual Evidence for UI changes.
- Project directory updates: update structured project/person data and verify affected Home routes.
- Future blog/post publishing: once the Home supports posts, Codex should treat authored posts as content changes requiring preview, link checks, and Visual Evidence for affected listing/detail pages.

## Source of Truth

When documents or code appear to disagree, use this order:

1. `AGENTS.md`: repository operating rules.
2. `docs/codex-cloud-setup.md`: remote Codex operating rules.
3. `README.md`: public overview of the repository.
4. `cv-chat/README.md` and `chat-worker/README.md`: local subproject context.
5. Code and tests: current executable behavior.
6. For the professional profile: visible `cv-chat` content is canonical; `chat-worker/src/profile-data.ts` should stay aligned with it and may include complementary non-visible context.

If a contradiction affects the task, Codex should call it out instead of silently choosing a convenient interpretation.

Professional profile integrity:

- Codex may improve structure, UI presentation, and wording.
- Codex must not invent or materially change professional facts without a clear source or explicit user confirmation.
- Sensitive professional facts include current role, employers, dates, education, certifications, experience level, client/project claims, technology proficiency, and contact details.
- When visible `cv-chat` content changes professional facts, keep **Profile Knowledge** aligned and update deterministic tests when needed.
- Professional experience update PRs should summarize which facts changed and which profile knowledge files/tests were updated.

## Codex Environment

Create one full-access remote Codex environment for this repository:

- Repository: `miguelgarglez/miguelgarglez.github.io`.
- Branch: `main` by default.
- Runtime: Node.js 22 and npm 10+.
- Access model: one broad environment for the personal site, with GitHub, browser tooling, issue-tracking context, and relevant project configuration available.
- Safety model: full operational access, with destructive actions protected by explicit user confirmation.
- Setup command:

```bash
bash scripts/codex-cloud-setup.sh
```

- Verification command before PR:

```bash
bash scripts/codex-cloud-verify.sh
```

Why this split matters: setup is allowed to install workspace dependencies and prove the baseline once; verification is the repeatable command Codex should run after edits. Keeping both commands explicit makes failures easier to locate.

## Internet Access

If the Codex environment supports network controls, enable internet access for this repository environment. Even though the environment is intentionally broad, task prompts should still name which external systems are expected to be used.

Recommended allowlist:

- `registry.npmjs.org` for `npm ci`.
- `github.com` and `api.github.com` for GitHub metadata, PRs, and Actions.
- `objects.githubusercontent.com` and `githubusercontent.com` for GitHub assets used by actions/tools.
- `api.cloudflare.com` for Cloudflare deployment metadata and logs when needed.
- `*.workers.dev` only when testing the deployed Worker endpoint.
- `api.openai.com` or the configured OpenAI-compatible LLM provider only when intentionally testing live chat behavior.
- `api.linear.app` for Linear issue context.
- `api.supabase.com` and the specific Supabase project host if a task truly needs database access.
- `api.vercel.com` only for `chat-backup-vercel` or Vercel backup tasks.

This repo uses a full-access environment by choice. The reliability rule is therefore not "no access"; it is "explicit intent": Codex should state when it uses GitHub, Cloudflare, Linear, Supabase, Vercel, the browser, or live LLM endpoints.

Destructive actions require explicit confirmation in the task or conversation. This includes deleting projects, deployments, branches, databases, tables, buckets, records, logs, secrets, environment variables, tokens, users, permissions, DNS records, or production data; rotating credentials; disabling services; force-pushing shared branches; and purging caches when it can affect production behavior.

Non-destructive operational actions are allowed when relevant to the task: reading logs, inspecting deployments, reading issues, reading PRs, opening branches, committing changes, opening draft PRs, running checks, creating previews, and reading configuration.

## Required Connectors and MCPs

Configure these in the Codex workspace or agent environment, depending on what the product UI supports:

- GitHub: required for repository access, PRs, Actions jobs, and review comments.
- Linear: useful for reading product/task context and linking PRs to issues.
- Cloudflare/Wrangler: available only when a task explicitly needs manual Worker deploys, live logs, or Worker secret management. Deployment is handled by GitHub Actions by default.
- Vercel: available only for the backup chat deployment under `chat-backup-vercel/` or tasks that explicitly mention Vercel.
- Supabase: available only for tasks that explicitly reference external Supabase-backed projects or future Supabase integrations. The current personal site does not use Supabase directly.
- Browser/Playwright: required for visual verification of Astro pages and chat failover behavior.
- OpenAI docs / Context7 docs: useful for current API, SDK, Astro, Cloudflare, and Vercel guidance.

Local skills are not automatically portable just because they exist on a laptop. For cloud reliability, copy reusable team skills into the Codex workspace/plugin mechanism where available, and keep repo-specific behavior in `AGENTS.md` plus this document.

Linear usage:

- If a task includes a Linear issue ID or Linear link, Codex must read the issue before changing code.
- If no Linear issue is mentioned, Linear is optional and should not be queried by default.
- If Linear context contradicts `AGENTS.md`, this document, or current code, Codex should call out the contradiction.
- PRs should link the Linear issue when the task came from Linear.

Supabase usage:

- The current personal site does not have a direct Supabase integration.
- Do not query Supabase for ordinary Home, CV Chat, Chat Worker, or GitHub Pages tasks.
- Use Supabase only when a task explicitly references a Supabase-backed external project, future integration, or data check.
- Never mutate Supabase data or schema without explicit user confirmation.

Vercel usage:

- The primary deployment path is GitHub Pages plus Cloudflare Worker.
- Vercel is secondary and currently scoped to `chat-backup-vercel/` or explicit fallback/diagnostic tasks.
- Do not inspect or modify Vercel projects, deployments, or environment variables unless the task mentions Vercel or the backup chat deployment.
- Do not manually deploy to Vercel unless explicitly requested.

## Secrets and Variables

Do not commit secrets. Add them through the Codex environment secret manager and through the relevant deployment provider.

GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

GitHub Actions variables:

- `PUBLIC_CHAT_API_SECONDARY_URL` if the backup endpoint should be active.

Cloudflare Worker secrets:

- `LLM_PROVIDER`
- `LLM_API_KEY`
- `LLM_BASE_URL`
- `LLM_MODEL`
- `LLM_SITE_URL`
- `LLM_APP_TITLE`

Frontend build variables used by GitHub Pages:

- `PUBLIC_WORKER_CHAT_URL`
- `PUBLIC_CHAT_API_PRIMARY_URL`
- `PUBLIC_CHAT_API_SECONDARY_URL`

For this repository, remote Codex is expected to have broad operational access, but Cloudflare deploy credentials are not required in the Codex environment by default because deployment is handled by GitHub Actions after merge. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to the Codex environment only if a task explicitly needs manual Cloudflare deploys, live logs, or Worker secret management.

Task prompts should still avoid live systems unless useful for the requested outcome, and PR notes should mention when live credentials or production-adjacent systems were used.

Having a credential available is not permission to perform destructive operations with it. Destructive operations still need explicit confirmation.

Secret handling rules:

- Store secret values only in the Codex environment or the relevant provider.
- Keep this repo limited to secret names, purpose, and setup instructions.
- Never print secret values in PRs, commits, screenshots, logs, comments, or final task notes.
- If a required secret is missing, report the missing secret by name and explain which operation is blocked.
- Do not rotate, delete, rename, or overwrite secrets without explicit user confirmation.

## Visual Verification

For UI changes, Codex must run a local dev server and inspect the page in a real browser:

```bash
npm run dev -- --host 0.0.0.0
npm run dev --prefix cv-chat
```

This is required for changes under:

- `src/pages/**`
- `src/components/**`
- `src/styles/**`
- `cv-chat/src/pages/**`
- `cv-chat/src/components/**`
- `cv-chat/src/styles/**`

Check at least:

- Root home page.
- Project detail pages touched by the change.
- `cv-chat` landing page.
- Chat launcher and basic chat error states if chat UI changed.
- Mobile and desktop widths.

PR notes must include the routes and viewport sizes that were visually checked. For UI changes, Codex should capture screenshots of the affected screens or states. Prefer attaching screenshots to the PR; if that is not supported, include them in the final task notes or list the screenshots that were captured. The user may do additional manual testing afterward; Codex's responsibility is to provide first-pass visual evidence.

If browser screenshots are unavailable, Codex must say so explicitly and treat it as residual risk.

If live chat behavior is changed, test the Worker endpoint separately. The deterministic profile-agent suite does not call the LLM, by design.

LLM-backed live tests are not required by default. Prefer deterministic tests for profile knowledge, retrieval behavior, and ordinary content changes. Use live LLM/provider tests when the task asks for them or when changing streaming behavior, provider configuration, error handling, request/response formats, or production chat integration.

## GitHub and PR Workflow

Expected Codex task flow:

1. Read `AGENTS.md`, this setup document, and the nearest nested `AGENTS.md`.
2. Create a branch using the `codex/` prefix.
3. Make the smallest coherent change.
4. Run the focused command first, then `bash scripts/codex-cloud-verify.sh`.
5. Inspect GitHub Actions if a PR check fails.
6. Update the PR until checks are green or the blocker is clearly documented.

Remote Codex tasks should always end in a branch and PR, even for small documentation or configuration changes. This keeps async work reviewable, traceable, and connected to checks.

Codex should not merge PRs by default. It may open draft PRs, mark work as ready when validation passes, investigate failing checks, and push fixes. Merging requires explicit user instruction for that task, such as "merge it if all checks pass".

Codex should not manually deploy by default. Normal production deployment should happen through GitHub Actions after the user merges to `main`. Manual Cloudflare, Vercel, or GitHub Pages deploys are allowed only when the task explicitly asks for a manual deploy or hotfix.

CI and workflow handling:

- If a PR check fails, Codex may inspect GitHub Actions logs and workflow files.
- Codex may modify `.github/workflows/**` when the failure is caused by workflow configuration or when the task explicitly asks for CI changes.
- Codex must not hide failures by removing tests, weakening checks, skipping relevant jobs, or relaxing permissions without calling out the trade-off.
- Changes to workflow permissions, deployment behavior, repository secrets, or release automation are sensitive and must be explained in the PR.

Release Please may open or update release PRs after merge to `main`; do not manually edit generated release PR content unless the task is specifically about release automation.

## Task Prompt Template

Use this structure when launching remote tasks:

```text
Repo: miguelgarglez/miguelgarglez.github.io
Read first: AGENTS.md and docs/codex-cloud-setup.md.
Goal: <specific user-visible outcome>
Scope: <root Astro | cv-chat | chat-worker | workflows | docs>
Validation: run the focused tests, then bash scripts/codex-cloud-verify.sh.
Visual check: <pages/viewports to inspect, if UI>
External systems expected: <GitHub | Cloudflare | Linear | Supabase | Vercel | browser | live LLM | none>
PR: open a draft PR with a concise summary and validation notes.
```

## Master Prompt

Use this as the default instruction block for remote Codex tasks:

```text
Read AGENTS.md, CONTEXT.md, and docs/codex-cloud-setup.md first.

Create a codex/* branch and open a PR for the work. Do not merge the PR unless this task explicitly says to merge when checks pass. Do not manually deploy unless this task explicitly asks for a manual deploy or hotfix.

Use the repository's full operational access as needed, including GitHub, browser tooling, Cloudflare, Linear, Vercel, Supabase, and live LLM endpoints when relevant. Supabase and Vercel are only in scope when the task explicitly mentions the external project, backup deployment, or future integration. Ask before destructive actions such as deleting resources, rotating secrets, changing DNS, force-pushing shared branches, mutating production data, or disabling services.

For UI changes, run the relevant dev server, verify affected routes in a real browser at desktop and mobile widths, and provide screenshots or screenshot notes in the PR/task summary.

Run focused validation for the change, then run npm run codex:verify. If checks fail, inspect GitHub Actions logs and push fixes. Do not hide failures by removing tests, skipping relevant jobs, or weakening checks without explicitly explaining the trade-off.
```

## Current Gaps

- There is no committed Playwright test suite yet; visual verification depends on browser tooling and screenshots in the agent environment.
- `chat-worker` does not have its own `package.json`; Worker validation is currently covered by root-level deterministic tests and the Cloudflare deploy workflow.
- Live Worker logs and deployment inspection require Cloudflare credentials outside the repo.

## Maintenance

Codex should update this document when a task uncovers a reusable operating rule for the remote workflow. Do not add one-off incidents, temporary outages, or task-specific noise.

Good additions:

- Required validation for a class of changes.
- A provider or workflow constraint that future agents must know.
- A recurring visual verification expectation.
- A missing secret or environment variable name and purpose.

Bad additions:

- Temporary network failures.
- One-time provider slowness.
- Notes that only explain a single PR.
