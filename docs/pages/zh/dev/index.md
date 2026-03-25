---
title: 参与开发
categories:
  - dev
end: false
---

- `create-valaxy`
- `create-valaxy-theme`

## AI-Assisted Development {#ai-assisted-development}

Valaxy supports AI-assisted development workflows. See [AI-Assisted Development](./ai) for details.

Quick example - fix a GitHub issue automatically:

```bash
/fix-github-issue 628
```

## Dev {#dev}

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

### Docs {#docs}

We use valaxy to build docs. Just eat our own dog food.

> If you want to use more out-of-the-box for docs, you can use [VitePress](https://vitepress.dev/).

```bash
# build latest valaxy cli
pnpm run build

pnpm run docs:build
```

If you want to display info better in two terminal (**Recommended**), follow below.

### Node {#node}

```bash
# watch valaxy & valaxy-theme-yun
pnpm dev:lib
```

### Client {#client}

If you only want to develop client.

- Docs: `pnpm docs:dev`
- Demo(theme-yun): `pnpm demo`

