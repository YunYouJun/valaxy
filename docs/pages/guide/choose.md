---
title: 'How to choose a static blog framework: Valaxy, Hexo, VitePress, Hugo, and Astro'
description: 'How to choose a static blog framework: what Valaxy gives a Vue blog, and when Hexo, VitePress, Hugo, or Astro fit instead.'
ogImage: /images/choose-og.png
categories:
  - guide
---

A static blog framework publishes Markdown posts as a site with lists, tags, archives, and a theme. This page compares Valaxy with Hexo, VitePress, Hugo, and Astro.

::: tip
Data as of 2026-10-28. Qualitative only. Build times are not recorded.
:::

## Valaxy fits you if…

You want a Vue blog, or you are leaving Hexo and can accept a new theme.

- **Vite hot reload** for config and posts. See [Features](/guide/features).
- **Typed** `valaxy.config.ts` and `site.config.ts`. Hexo uses `_config.yml`.
- **Tags, archives, RSS, and a sitemap** are built in. VitePress is for documentation. See [Why Valaxy](/guide/why).
- **Themes you override as Vue components.** [Yun](/themes/yun) for the blog. [Press](/themes/press) when the same site should read as docs. See [Customizing components](/guide/custom/components).
- **SSG, then SPA navigation.** `valaxy build --ssg` writes one HTML file per route. Later clicks do not reload the page. See [Commands](/guide/commands).
- **A full Chinese tree** at `/zh/`, and posts copy from Hexo `source/_posts` to `pages/posts`. See [Migration](/migration/).
- **Addons** for comments, search, and galleries. See [Addons](/addons/use).

```bash
pnpm create valaxy
```

[Get started](/guide/getting-started). From Hexo, follow [Migration](/migration/) and use [Yun](/themes/yun). Requires Node.js 22.12 or newer.

## Comparison

<ChooseCompare lang="en" />

Taken from [Why Valaxy](/guide/why), [Getting Started](/guide/getting-started), [Features](/guide/features), [Commands](/guide/commands), and [Migration](/migration/). Hugo's speed is a reason to pick Go, not a benchmark against Valaxy.

## Decision tree

What are you publishing?

- **A personal or technical blog on Vue**, or a move off Hexo when a new theme is acceptable. Choose Valaxy. [Get started](/guide/getting-started). From Hexo, [Migration](/migration/). Use [Yun](/themes/yun). Use [Press](/themes/press) when that Valaxy site should read as docs and still have posts, tags, and addons.
- **One Hexo theme or plugin is the product**, and you will not replace it. Stay on Hexo. That is theme lock-in.
- **Documentation for a library or product**, with no blog post model. Choose VitePress. To keep the docs on Valaxy, use [Press](/themes/press).
- **A Go toolchain** matters more than Vue components. Choose Hugo. This page does not claim Valaxy builds faster.
- **Pages mix UI frameworks**, or each page should load as its own document. Choose Astro.

## When not Valaxy {#when-not-valaxy}

- A specific Hexo theme or plugin is the product, and replacing it is unacceptable.
- The site is only a library manual. Use VitePress.
- You want Go templates, and that toolchain's speed is the requirement. No Valaxy-versus-Hugo timing is published here.
- Pages must mix more than one UI framework. Use Astro.
- You need accounts on a server. Comments are client-side [addons](/addons/use) such as Waline or Twikoo.
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

<ChooseFaqJsonLd lang="en" />
