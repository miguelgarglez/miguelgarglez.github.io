# Use one full-access Codex environment

We will use a single broad Codex cloud environment for this personal site instead of maintaining separate least-privilege environments per task type. This trades a larger permission surface for lower coordination overhead and higher agent autonomy across GitHub, visual verification, deployment diagnostics, issue context, and connected services.

Supabase may be available in the environment, but the current personal site does not use it directly; Codex should only use Supabase when a task explicitly references an external Supabase-backed project or future integration.

Vercel may also be available, but it is secondary for this repository. The primary deployment path is GitHub Pages plus Cloudflare Worker; Vercel is only for `chat-backup-vercel/` or explicit fallback/diagnostic tasks.

Cloudflare deployment credentials are not part of the default Codex Cloud secret set because production deployment is handled by GitHub Actions after merge. They can be added later for explicit manual deploy, live-log, or Worker-secret-management tasks.

The environment has full operational access, but destructive actions require explicit user confirmation. Codex may read logs, inspect deployments, open branches, run checks, and create PRs as part of normal work; it must not delete resources, rotate credentials, force-push shared branches, modify DNS, purge production-impacting caches, or mutate production data unless the user clearly asked for that operation.

Secret values must stay in provider or Codex environment storage and must not be printed into repo files, PRs, screenshots, logs, comments, or task notes. Missing secrets should be reported by name and purpose rather than worked around silently.

Codex also should not merge PRs by default. It should get work to a reviewed, validated PR state and leave the final merge to the user unless the task explicitly authorizes merging when checks pass.

Codex should not manually deploy by default. Production should normally follow `main` via GitHub Actions; manual Cloudflare, Vercel, or GitHub Pages deploys are reserved for tasks that explicitly request a manual deploy or hotfix.

For UI changes, Codex must verify the affected pages in a real browser at desktop and mobile widths, capture screenshots of the affected screens when the environment supports it, and record the checked routes in the PR. Build success alone is not sufficient evidence for visual changes.

Remote Codex work should always be delivered through a branch and PR, even for small documentation or configuration changes, so async changes remain reviewable and connected to CI.

Codex may inspect GitHub Actions whenever checks fail, but workflow changes should address a real workflow cause or an explicit CI task. It must not make CI green by hiding relevant failures.

Reusable operating rules discovered during remote tasks should be added to `docs/codex-cloud-setup.md`; one-off incidents should stay in the relevant PR or task notes.
