---
title: 参与开发
categories:
  - dev
end: false
---

- `create-valaxy`
- `create-valaxy-theme`

## AI 辅助开发 {#ai-assisted-development}

Valaxy 目前使用 Codex 辅助开发，以根目录 `AGENTS.md` 记录项目约定。环境准备、任务示例与验收方法见 [AI 辅助开发](./ai)。

可以直接用自然语言描述任务：

```text
读取 AGENTS.md，复现并修复这个 issue：<issue URL>。
为行为缺陷添加回归测试，运行相关检查，并说明修改原因和验证结果。
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
