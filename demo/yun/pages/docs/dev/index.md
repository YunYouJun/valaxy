---
title: Participate in Development
title_zh: 参与开发
layout: docs
categories:
  - Docs
  - Dev
end: false
---

- `create-valaxy`
- `create-valaxy-theme`

## Todo

- [ ] create-valaxy-theme: Script to generate theme template.
- [ ] Debug component.
- [ ] local search

## Dev

You must use [pnpm](https://pnpm.io/). Because we use its workspace.

```bash
git clone https://github.com/YunYouJun/valaxy
cd valaxy

pnpm i
# esbuild watch valaxy cli & valaxy-theme-yun
# and run demo
pnpm dev
```

If you want to display info better in two terminal (**Recommended**), follow below.

### Node

```bash
# watch valaxy & valaxy-theme-yun
pnpm dev:lib
```

### Client

If you only want to develop client.

```bash
# open a new terminal to run demo
pnpm demo
```
