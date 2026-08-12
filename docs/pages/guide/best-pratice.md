---
title: Best Practices
categories:
  - guide
top: 1
---

These recommendations keep a Valaxy blog portable and make development-only problems less likely to reach production. They are guidelines rather than requirements.

## Project and Dependencies

- Use a supported Node.js version and keep it consistent between local development and CI. See [Getting Started](/guide/getting-started) for the current requirement.
- Use one package manager throughout the project. We recommend `pnpm`; commit `pnpm-lock.yaml` so CI and local development resolve the same dependency graph.
- Add every package imported by your config or components to the blog's own `package.json`. Do not rely on a dependency that happens to be installed transitively by Valaxy, a theme, or another addon.
- Upgrade Valaxy and its official theme or addons together when possible. Run a production build after upgrading.

## Posts and Assets

Use stable, URL-friendly English names for folders and files:

```txt
blog/pages/posts/your-post.md
```

For local post assets, colocate them with the post and use relative paths. This makes the post easy to move and lets Vite process the assets for both the page and generated feeds.

```txt
pages/posts/your-post
├── a.png
├── b.png
└── index.md
```

```md [pages/posts/your-post/index.md]
![Image A](./a.png)
![Image B](./b.png)
```

Root-absolute links in Markdown are adjusted automatically when the site is deployed under a subpath. For URLs created inside Vue components, use `withBase()`. See [Deploying under a base path](/guide/deploy#deploying-under-a-base-path).

## Dynamic and Third-party Content

Encapsulate third-party scripts and highly dynamic content as Vue components in `components/`, then use the component from Markdown. This keeps side effects out of the post and gives you one place to handle loading, errors, and cleanup.

```bash
pnpm add @vueuse/core
```

```vue [components/BszComponent.vue]
<script lang="ts" setup>
import { useScriptTag } from '@vueuse/core'

useScriptTag('https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js')
</script>

<template>
  <div>
    <div>Total visits: <span id="busuanzi_value_site_pv" /></div>
    <div>Total visitors: <span id="busuanzi_value_site_uv" /></div>
  </div>
</template>
```

```md [pages/posts/test-custom-component.md]
# Hello World

<BszComponent />
```

Valaxy generates pages with SSR. If a library accesses `window`, `document`, or another browser API, initialize it after mounting or load it through a client-only component. See [SSR Compatibility](/guide/ssr-compat).

## Choose the Smallest Extension Level

| Need | Recommended integration |
| --- | --- |
| A supported Markdown syntax such as diagrams | Use the built-in feature first, such as [Mermaid](/guide/markdown#mermaid) |
| A library or widget used by one blog | Create a local component in `components/` |
| A reusable component shared by several blogs | Publish a component package or contribute it to `valaxy-addon-components` |
| Markdown transforms, build hooks, shared configuration, or automatic component registration | [Write an addon](/addons/write) |

For a simple mind map, use the built-in [Mermaid mindmap example](/examples/mermaid#mindmap). Start a Markmap integration as a local `Markmap.vue` component using `markmap-lib` and `markmap-view`, initialized on the client. A dedicated addon becomes worthwhile when it also provides a fenced `markmap` Markdown syntax, shared theme and toolbar options, asset handling, and an SSR-safe lifecycle. Until then, an addon adds installation and maintenance cost without reducing much user code.

## Verify Before Deployment

Development mode cannot expose every SSR, dependency, or subpath problem. Before deploying:

```bash
pnpm build
pnpm serve
```

Check at least the home page, a post opened directly or refreshed, a page containing third-party content, and the production subpath if `vite.base` is configured.

When reporting a problem, include the smallest reproduction, the full error, whether it occurs in development or production, and the environment output from:

```bash
pnpm exec valaxy debug --plain
```
