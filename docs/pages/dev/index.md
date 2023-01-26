---
title: Participate in Development
title_zh-CN: 参与开发
categories:
  - Dev
end: false
---

- `create-valaxy`
- `create-valaxy-theme`

## Todo

- [ ] create-valaxy-theme: Script to generate theme template.
- [ ] create-valaxy-addon: Script to generate addon template.
- [ ] Debug component.
- [x] local search
- [ ] algolia search for valaxy-theme-press
- [ ] Image preview by [lightGallery](https://www.lightgalleryjs.com/docs/vue/)

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
