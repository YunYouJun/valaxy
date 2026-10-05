---
title: AI-Assisted Development
categories:
  - dev
---

Valaxy currently uses **Codex** to help develop the core framework, themes, addons, and documentation. This page explains how to provide repository context, request focused changes, and obtain reproducible verification results.

This guide is for **Valaxy repository contributors**. To create a blog, write posts, or change site settings, start with [Getting Started](/guide/getting-started).

## Prepare the development environment {#setup}

Use Node.js `>=22.12.0` and the pnpm version specified by `packageManager` in the root `package.json`. Valaxy uses pnpm workspaces. Run repository commands from the project root:

```bash
git clone https://github.com/YunYouJun/valaxy.git
cd valaxy
pnpm install
pnpm build
```

`pnpm build` builds the shared utilities, core framework, and DevTools in order. Complete it before starting the documentation or demo site for the first time.

Open the repository directory in Codex and start a task. To work in a terminal, follow the [official Codex CLI guide](https://learn.chatgpt.com/docs/codex/cli) to install and sign in, then run this from the repository root:

```bash
codex
```

Start with a read-only task to confirm the working directory and project conventions:

```text
Read AGENTS.md and package.json. Summarize the repository structure,
package manager, build commands, and test commands.
Check the current Git status and describe existing changes.
Read only for this step; do not modify files.
```

## Repository instructions: AGENTS.md {#agents-md}

The root [AGENTS.md](https://github.com/YunYouJun/valaxy/blob/main/AGENTS.md) provides Codex with the package structure, configuration and routing flow, build order, tests, and release process.

Codex reads applicable `AGENTS.md` instructions. See the [official guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md) for discovery and precedence of global and directory-level instructions. Describe the goal, scope, and acceptance criteria for each task in the conversation.

Keep reusable project rules in `AGENTS.md` and keep commands consistent with the root `package.json`. Put temporary paths, individual errors, and verification results in the relevant task record.

## Describe tasks in natural language {#available-commands}

Include the **goal, relevant context, scope, and acceptance criteria**. Provide specific files, issue links, reproduction steps, logs, or screenshots so Codex can investigate from concrete evidence.

### Fix a GitHub issue {#fix-github-issues}

Replace the placeholder with the actual issue:

```text
Fix this Valaxy issue: <issue URL>.

Read AGENTS.md, the issue description, and its discussion, then reproduce it.
Identify the cause, make a focused fix, and add a regression test that proves
any behavior defect is fixed. Preserve existing working-tree changes.
Run the affected tests and relevant repository checks.

Deliver the cause, a change summary, verification commands and results,
and any unresolved problems. Leave local changes for this task;
do not commit, push, or create a PR.
```

If the environment cannot access GitHub, paste the issue description, reproduction steps, and relevant logs. Explicitly request commits, pushes, or PR creation when needed, including the target branch.

### Update documentation or a theme {#docs-and-themes}

```text
Update docs/pages/zh/guide/getting-started.md and its English counterpart.
Compare the instructions with create-valaxy and the actual templates.
Correct outdated guidance while preserving information that remains valid.
Check that commands, configuration filenames, and example output agree.
Start the documentation preview, inspect both languages, code blocks,
and internal links, then run relevant checks.
```

For theme work, specify the target theme, visual references, and pages to verify. For example, after changing the Yun home page, inspect desktop and mobile layouts and confirm that post navigation and production builds still work.

### Verify the complete user workflow {#verify-workflow}

Tasks spanning scaffolding, dependency installation, and builds need verification in a clean project:

```text
Verify the complete Valaxy experience from creating a blog to its first
production build. Use packages packed from this repository in an independent
temporary directory. Follow Getting Started to install dependencies, start
the server, add a post, edit site settings, and build for production.
Record instructions that cannot be followed, outdated guidance, and failures.
After fixing them, repeat the workflow with a newly generated clean project.
Inspect the home page, post page, and build output, and deliver a reproducible
acceptance record. Do not publish a release.
```

The repository provides an acceptance runner for this workflow:

```bash
# Install the test browser before the first run
pnpm exec playwright install chromium
pnpm test:onboarding
```

It builds and packs the current repository, runs the blog workflow in a temporary directory, and saves logs, screenshots, and `test-results/onboarding/record.json`. The quick start's startup transcript is updated only after all acceptance checks pass. Keep and report failed results accurately.

## Choose checks for the change {#best-practices}

| Change | Common checks |
| --- | --- |
| Utilities, Markdown, or configuration behavior | Start with the relevant test file, such as `pnpm exec vitest run test/create-valaxy.test.ts`; use `pnpm test --run` for the complete unit suite |
| TypeScript / Vue code | `pnpm lint`, `pnpm typecheck`, and tests for the affected behavior |
| Core packages or CLI | `pnpm build`, followed by the relevant demo or CLI commands |
| Documentation | Preview with `pnpm docs:dev`; inspect both languages, links, and code examples, then verify static output with `pnpm docs:build` |
| Yun theme | Preview with `pnpm demo`, build with `pnpm demo:build`, and inspect affected desktop and mobile layouts |
| Scaffolding or onboarding | `pnpm test:onboarding` to verify installation, startup, and production builds from packed artifacts |

Choose the checks needed for the change. Report commands actually run, their pass or fail results, and any checks not performed. Retain logs and reproduction steps for failures.

## Reuse project skills {#creating-custom-commands}

The repository maintains two skill documents that you can explicitly ask Codex to read:

- [skills/valaxy/SKILL.md](https://github.com/YunYouJun/valaxy/blob/main/skills/valaxy/SKILL.md): blog configuration, posts, framework, theme, and addon development.
- [skills/valaxy-theme/SKILL.md](https://github.com/YunYouJun/valaxy/blob/main/skills/valaxy-theme/SKILL.md): generating or redesigning a theme and verifying a runnable theme and demo site.

For example:

```text
Read skills/valaxy-theme/SKILL.md, then redesign the theme with these requirements: …
Provide a runnable demo, verify the home page, post page, and mobile layout,
and explain how to preview it.
```

## Other AI tools {#claudemd}

The repository still contains `CLAUDE.md` and `.claude/commands/fix-github-issue.md` for Claude Code workflows. The `/fix-github-issue` example in earlier documentation comes from that command file; it is **not a built-in Codex command**.

With other tools, explicitly request that they read `AGENTS.md` and relevant skill documents and check the current code and `package.json`. The task examples on this page also work as ordinary prompts.
