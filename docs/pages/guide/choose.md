---
title: How to Choose
description: Choose among Valaxy, Hexo, VitePress, Hugo, and Astro for a personal or technical blog.
categories:
  - guide
---

**Data as of:** 2026-10-28. Cells are qualitative. This page does not record build times.

## Definition

Valaxy is a static blog framework, not a general static site generator. Posts are Markdown, configuration is TypeScript (`valaxy.config.ts` and `site.config.ts`), and themes are Vue 3 components. Vite hot-reloads config files and Markdown during development. `valaxy build --ssg` writes one HTML file per route, and the site can also emit RSS and a sitemap. Styling is UnoCSS. The official blog theme is [Yun](/themes/yun). [Press](/themes/press) is the documentation-shaped theme that still runs on Valaxy. Chinese and English docs are both maintained. Node.js 22.12 or newer is required.

A general generator can store posts, but lists, tags, archives, feeds, and themes are pieces you add. Hexo is the other blog framework in this table. VitePress, Hugo, and Astro are generators that people also use for blogs. The useful question is which of those pieces already exist before you start.

## Comparison

| Framework | Language / stack | Build feel | Learning curve | Chinese docs / community | Theme / blog ecosystem | Deploy | Best for |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Valaxy](/guide/getting-started) | Vue 3, Vite, TypeScript config, Markdown | Vite hot reload for config and Markdown. Publish with SSG. | Short if you know Vue. Steeper than Hexo if you have only used YAML themes. | Chinese and English docs are both first-class (`/zh/` and `/`). | [Yun](/themes/yun) and [Press](/themes/press), plus a [gallery](/themes/gallery) smaller than Hexo. Override Vue components by name. | Static `dist/` on [any static host](/guide/deploy). | A personal or technical blog on Vue and Vite. |
| [Hexo](https://hexo.io/) | Node.js, Markdown, `_config.yml` | Generate, then refresh. Not a Vite dev server. | Lowest for a classic Chinese blog: pick a theme and write posts. | Chinese docs and the Chinese community are the default. | Largest Chinese blog theme and plugin ecosystem. Those themes do not run on Valaxy. | Static `public/`. `hexo deploy`, or any static host. | Keeping a Hexo theme or plugin you already rely on. |
| [VitePress](https://vitepress.dev/) | Vue 3, Vite, Markdown | Vite dev server, aimed at previewing docs. | Low for a docs site on the default theme. | Official docs include Chinese. | A documentation theme. Post lists, tags, and a blog theme market are not the product. | Static output on any static host. | Documentation for a library or product. |
| [Hugo](https://gohugo.io/) | Go binary, Go templates, Markdown | Very fast dev and production builds. No number is claimed here. | The template and content model, not Vue. Installing the binary is the easy part. | Docs are mainly English. Chinese blog material is smaller than Hexo's. | Many themes, aimed at sites more than at the Chinese personal-blog scene. | Static `public/` on any static host. | Large sites where build speed and a Go toolchain matter more than Vue. |
| [Astro](https://astro.build/) | Node.js, Vite, islands. Vue is optional. | Vite dev. Navigation reloads the document. | You assemble lists, tags, and feeds yourself. | Official docs include Chinese. Fewer drop-in Chinese blog themes than Hexo. | Content themes exist. Not a theme you only configure. | Static by default, or a server adapter. | A content site that mixes UI frameworks. |

The Valaxy column is taken from this repo: [Why Valaxy](/guide/why), [Getting Started](/guide/getting-started), [Commands](/guide/commands), and [Migration](/migration/). Other rows follow those pages and each project's own description. "Very fast" for Hugo is the reason to pick that toolchain, not a benchmark run for this page. Astro's full-page navigation is the tradeoff recorded in [Why Valaxy](/guide/why).

## Decision tree

What are you publishing?

- Documentation for a library or product, and you do not need a blog post model.
  - Choose VitePress.
- A personal or technical blog.
  - You already depend on a Hexo theme or plugin, and you do not want to rebuild it.
    - Stay on Hexo.
  - You are leaving Hexo. Copying Markdown is enough, and the theme will be new.
    - Choose Valaxy, then follow [Migration](/migration/).
  - You want Vue 3, Vite, and a typed config.
    - Choose Valaxy. Start at [Getting Started](/guide/getting-started). Use [Yun](/themes/yun) for a blog. Use [Press](/themes/press) when that Valaxy site should read as docs and still have posts, tags, and addons.
  - Build speed and a Go toolchain matter more than Vue components.
    - Choose Hugo.
  - Pages should mix UI frameworks, or each page should load as its own document.
    - Choose Astro.
- Still unsure.
  - If the main object is posts, tags, and a theme, compare Valaxy and Hexo above.
  - If the main object is a sidebar of documentation, choose VitePress.

## If X choose Y

- If you want a personal blog in Vue and Vite with typed config, choose Valaxy.
- If you need a mature Chinese Hexo theme or plugin and do not want to migrate, stay on Hexo.
- If you are leaving Hexo and can accept a new theme, choose Valaxy and use the [migration guide](/migration/). Posts move from `source/_posts` to `pages/posts`. Hexo themes do not move with them.
- If you are documenting a library, choose VitePress.
- If you want documentation that stays on Valaxy, including posts and addons, choose the [Press](/themes/press) theme.
- If you need very fast builds and a Go toolchain, choose Hugo.
- If one site should mix Vue, React, or Svelte, choose Astro.

## Selection FAQ

### How is Valaxy different from Hexo?

Both are blog frameworks: Markdown posts, themes, and a static build. Hexo uses `_config.yml` and has the larger Chinese theme and plugin catalog. Valaxy uses TypeScript config, Vue components, and Vite hot reload for config and Markdown. Moving posts is a file copy. Moving a Hexo theme means rewriting it. See [Migration from Hexo](/migration/).

### Should I use a blog framework or a docs generator?

Use Valaxy or Hexo when the site is posts, tags, archives, and a blog theme. Use VitePress when the site is documentation. Valaxy's [Press](/themes/press) theme is for docs that should stay on Valaxy's routing, addons, and blog data. It is not a reason to skip VitePress for a standalone library site.

### What is the difference between the SPA build and SSG?

`valaxy build` emits a single-page app. `valaxy build --ssg` is the recommended publish command: one HTML file per route, then Vue hydrates it. Later navigations update the page instead of reloading the whole document. Use SSG for a public blog. See [Commands](/guide/commands).

### How complete is Chinese support?

This docs site keeps a full Chinese tree at `/zh/` beside the English pages. Site text uses Vue i18n, and one page can carry two languages with [CSS i18n](/guide/i18n). That does not mean the theme catalog matches Hexo. Hexo still has the deeper Chinese theme and plugin community.

### When should I not choose Valaxy?

Stay on Hexo when an existing theme or plugin is the reason the site exists and you will not rebuild it. Use VitePress for a library docs site. Use Hugo when you want Go templates and very fast builds. Use Astro when pages should mix UI frameworks. Valaxy does not run a dynamic server for accounts or a built-in comment database. Comments are client-side [addons](/addons/use) such as Waline or Twikoo. The runtime requirement is Node.js 22.12 or newer.
