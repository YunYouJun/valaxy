---
title:
  en: Participate in Development
  zh-CN: 参与开发
categories:
  - dev
end: false
---

- `create-valaxy`
- `create-valaxy-theme`

## AI-Assisted Development

Valaxy currently uses Codex for AI-assisted development, with project instructions in the root `AGENTS.md`. See [AI-Assisted Development](./ai) for setup, task examples, and verification workflows.

Describe a task in natural language:

```text
Read AGENTS.md, then reproduce and fix this issue: <issue URL>.
Add regression tests for behavior defects, run relevant checks,
and explain the cause, changes, and verification results.
```

## Dev

You must use [pnpm](https://pnpm.io/). Because we use its workspace.

```bash
git clone https://github.com/YunYouJun/valaxy
```

```bash [pnpm]
cd valaxy
pnpm i
# esbuild watch valaxy cli & valaxy-theme-yun
# and run demo

# build node cli
pnpm run build

# pnpm dev = pnpm dev:lib + pnpm demo
pnpm dev
```

### Docs

We use valaxy to build docs. Just eat our own dog food.

> If you want to use more out-of-the-box for docs, you can use [VitePress](https://vitepress.dev/).

```bash
# build latest valaxy cli
pnpm run build

pnpm run docs:build
```

If you want to display info better in two terminal (**Recommended**), follow below.

### Node

```bash
# watch valaxy & valaxy-theme-yun
pnpm dev:lib
```

### Client

If you only want to develop client.

- Docs: `pnpm docs:dev`
- Demo(theme-yun): `pnpm demo`
