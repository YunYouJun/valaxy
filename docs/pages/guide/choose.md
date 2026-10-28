---
title: How to Choose
description: Capabilities Valaxy gives a Vue blog, and when Hexo, VitePress, Hugo, or Astro fit instead.
categories:
  - guide
---

**Data as of:** 2026-10-28. Cells are qualitative. This page does not record build times.

## Valaxy fits you if…

You want a personal or technical blog, and you want these capabilities:

1. **Vite hot reload for config and Markdown.** Saving `valaxy.config.ts`, `site.config.ts`, or a post updates the preview. See [Features](/guide/features).
2. **Typed TypeScript config.** `valaxy.config.ts` and `site.config.ts` expose editor hints. Hexo uses `_config.yml`.
3. **Blog-native posts.** Tags, categories, pagination, RSS, and a sitemap ship with the framework. VitePress is built for documentation. See [Why Valaxy](/guide/why).
4. **Overridable Vue themes.** Replace a layout or component by name. [Yun](/themes/yun) is the blog theme. [Press](/themes/press) is the docs-shaped theme. See [Customizing components](/guide/custom/components).
5. **SSG, then SPA navigation.** `valaxy build --ssg` writes one HTML file per route. After that page loads, moving around the site does not reload the document. Astro's default static output does. See [Why Valaxy](/guide/why) and [Commands](/guide/commands).
6. **Chinese docs and a Hexo path.** `/zh/` is a full docs tree, not a partial translation. Posts copy from Hexo `source/_posts` to `pages/posts`. See [Migration](/migration/).
7. **Addons, Yun, and Press.** Comments, search, and galleries are [addons](/addons/use). You do not assemble the blog loop yourself.

```bash
pnpm create valaxy
```

Then follow [Getting Started](/guide/getting-started). Design notes are in [Why Valaxy](/guide/why). Leaving Hexo and can accept a new theme? Use [Migration](/migration/) and [Yun](/themes/yun).

## Definition

Valaxy is the Vue 3 and Vite blog framework in this comparison. A general generator can store Markdown, but lists, tags, archives, feeds, and themes are pieces you add. Hexo is the other blog framework here. VitePress, Hugo, and Astro are generators that people also use for blogs. Node.js 22.12 or newer is required.

## Comparison

| Framework | Language / stack | Build feel | Learning curve | Chinese docs / community | Theme / blog ecosystem | Deploy | Best for |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Valaxy](/guide/getting-started) | Vue 3, Vite, typed `valaxy.config.ts` and `site.config.ts`, Markdown | Vite hot reload for config and Markdown. SSG for publish, then SPA navigation. | Vue authors start with `pnpm create valaxy`. Customizing means Vue components. | Full Chinese and English docs (`/zh/` and `/`), plus a [Hexo migration guide](/migration/). | [Yun](/themes/yun), [Press](/themes/press), and [addons](/addons/use). The theme catalog is smaller than Hexo. You override Vue components instead of waiting for a port. | Static `dist/` on [any static host](/guide/deploy). | A personal or technical blog on Vue, including a move off Hexo when a new theme is acceptable. |
| [Hexo](https://hexo.io/) | Node.js, Markdown, `_config.yml` | Generate, then refresh. No Vite hot reload for config and posts. | Shortest path if you only pick an existing theme and will not write Vue. | Chinese docs and the Chinese community are the default. | Largest Chinese blog theme and plugin catalog. Those themes do not run on Valaxy. | Static `public/`. `hexo deploy`, or any static host. | Only when one Hexo theme or plugin is the product and you will not replace it. |
| [VitePress](https://vitepress.dev/) | Vue 3, Vite, Markdown | Vite dev server aimed at docs preview. Navigation is a docs site, not a blog SPA. | Low for a docs site on the default theme. You add blog pieces yourself. | Official docs include Chinese. | A documentation theme. Post lists, tags, RSS, and a blog theme market are not the product. | Static output on any static host. | Documentation for a library or product, with no blog post model. |
| [Hugo](https://gohugo.io/) | Go binary, Go templates, Markdown | Very fast dev and production builds. No number is claimed here, and none versus Valaxy. | The template and content model, not Vue. | Docs are mainly English. Chinese blog material is smaller than Hexo's. | Many site themes. Less aimed at the Chinese personal-blog scene, and not a Vue component theme. | Static `public/` on any static host. | Large sites where a Go toolchain matters more than Vue components. |
| [Astro](https://astro.build/) | Node.js, Vite, islands. Vue is optional. | Vite dev. Default static navigation reloads the document. | You assemble lists, tags, feeds, and a theme yourself. | Official docs include Chinese. Fewer drop-in Chinese blog themes than Hexo. | Content themes exist. Not a blog framework with Yun-style component overrides. | Static by default, or a server adapter. | A content site that mixes UI frameworks. |

Valaxy's row is taken from this repo: [Why Valaxy](/guide/why), [Getting Started](/guide/getting-started), [Features](/guide/features), [Commands](/guide/commands), and [Migration](/migration/). Hugo's "very fast" is why someone picks that toolchain. It is not a benchmark against Valaxy. Astro's full-page navigation is the tradeoff recorded in [Why Valaxy](/guide/why).

## Decision tree

What are you publishing?

- A personal or technical blog, and you want Vue and Vite — or you are leaving Hexo and can accept a new theme.
  - Choose Valaxy. [Get started](/guide/getting-started). From Hexo, follow [Migration](/migration/). Use [Yun](/themes/yun) for the blog. Use [Press](/themes/press) when that Valaxy site should read as docs and still have posts, tags, and addons.
- One Hexo theme or plugin is the product, and you will not replace it.
  - Stay on Hexo. That is theme lock-in, not a general reason to avoid Valaxy.
- Documentation for a library or product, with no blog post model.
  - Choose VitePress. If the docs should stay on Valaxy, use [Press](/themes/press) instead.
- A Go toolchain matters more than Vue components.
  - Choose Hugo. This page does not claim Valaxy builds faster.
- Pages should mix UI frameworks, or each page should load as its own document.
  - Choose Astro.

## If X choose Y

- If you want a personal blog in Vue and Vite with typed config, choose Valaxy and [get started](/guide/getting-started).
- If you are leaving Hexo and can accept a new theme, choose Valaxy and follow [Migration](/migration/). Posts move from `source/_posts` to `pages/posts`. Hexo themes do not.
- If one Hexo theme or plugin is the product and you will not replace it, stay on Hexo.
- If you are documenting a library and do not need posts, tags, or RSS, choose VitePress.
- If the documentation should stay on Valaxy, with posts and addons, choose the [Press](/themes/press) theme.
- If you need a Go toolchain and very fast builds, choose Hugo.
- If one site should mix Vue, React, or Svelte, choose Astro.

## When not Valaxy {#when-not-valaxy}

Do not choose Valaxy in these cases:

- A specific Hexo theme or plugin is the product, and replacing it is unacceptable. Otherwise migrate.
- The site is only a library manual. Use VitePress.
- You want Go templates, and build speed of that toolchain is the requirement. This page does not publish a Valaxy-versus-Hugo timing.
- Pages must mix more than one UI framework. Use Astro.
- You need a dynamic server for accounts. Comments are client-side [addons](/addons/use) such as Waline or Twikoo.
- Node.js is older than 22.12.

## Selection FAQ

### How is Valaxy different from Hexo?

Both are blog frameworks: Markdown posts, themes, and a static build. For a Vue author, Valaxy is the one with Vite hot reload, typed `valaxy.config.ts` / `site.config.ts`, and themes you override as Vue components. Hexo still has the larger Chinese theme catalog. Move when you can accept a new theme: copy posts, then use [Yun](/themes/yun). Stay on Hexo only when that existing theme or plugin is the product. See [Migration](/migration/).

### Should I use a blog framework or a docs generator?

Use Valaxy when the site is posts, tags, archives, and a blog theme. VitePress is the better fit only when the site is documentation and those blog pieces are not the product. [Press](/themes/press) keeps a docs-shaped site on Valaxy, including posts and addons. It does not replace VitePress for a standalone library manual.

### What is the difference between the SPA build and SSG?

`valaxy build` emits a single-page app. `valaxy build --ssg` is the publish command to use: one HTML file per route, then Vue hydrates it. Later navigations update the page instead of reloading the document. That in-site navigation is the difference from Astro's default static output, described in [Why Valaxy](/guide/why). See [Commands](/guide/commands).

### How complete is Chinese support?

This docs site keeps a full Chinese tree at `/zh/` beside the English pages. Site text uses Vue i18n, and one page can carry two languages with [CSS i18n](/guide/i18n). Hexo posts migrate with the [Chinese migration guide](/zh/migration/). Hexo still has the deeper theme and plugin community. Valaxy's Chinese docs are first-class. Its theme catalog is not as large, which is why component overrides matter.

### When should I not choose Valaxy?

Use the list in [When not Valaxy](#when-not-valaxy). The short version: stay on Hexo only for theme lock-in, use VitePress for a library manual, Hugo when the Go toolchain is the point, and Astro when one site mixes UI frameworks.
