---
title: Can VitePress be used as a blog?
description: Can VitePress be used as a blog? What a typical blog still has to add, compared with Valaxy and Hexo.
categories:
  - guide
---

Yes, with caveats. [VitePress](https://vitepress.dev/guide/what-is-vitepress) can host a blog. Its own docs list blogs beside documentation, and point to the Vue.js blog as the example: a custom theme, and an index generated from local Markdown. The default theme is for technical documentation. A typical blog's post list, tag pages, archives, RSS feed, and blog theme are not included, so you build and maintain them. [Valaxy](/guide/getting-started) is a Vue blog framework that includes them. [Hexo](https://hexo.io/) is a blog framework too: a site from `hexo init` includes the post index, tags, categories, archives, and a blog theme, and the feed is a separate official plugin. This page is qualitative. Hugo and Astro are in [How to choose a static blog framework](/guide/choose).

Valaxy was started when blogging was not yet a first-class VitePress use case. Compared with VitePress, it still ships more blog features out of the box, and more complete AI support for a blog: experimental Agent Skills, an opt-in MCP server, and `llms.txt` ([Work with AI](/guide/work-with-ai)). VitePress 2.0 is still an alpha ([releases](https://github.com/vuejs/vitepress/releases)). On 2026-11-05, npm `latest` is 1.6.4 and `next` is `2.0.0-alpha.21`. That alpha line started with `2.0.0-alpha.1` on 2025-01-22.

::: tip
Checked against the VitePress and Hexo docs, and the npm `vitepress` dist-tags, on 2026-11-05 (Asia/Shanghai). Qualitative only.
:::

## What a typical blog still has to add

| Need | VitePress | Valaxy | Hexo |
| --- | --- | --- | --- |
| Post list | A custom index, as on the Vue.js blog | From `pages/posts` | Included in `hexo init` |
| Tags and categories | Custom pages | [Tag and category layouts](/guide/layout) | Included in `hexo init` |
| Archives | A custom page | [Archives layout](/guide/layout) | Included in `hexo init` |
| RSS | A feed you add | Built in, and on by default once `url` is set ([RSS](/guide/features#rss)) | Official plugin [`hexo-generator-feed`](https://github.com/hexojs/hexo-generator-feed), not part of `hexo init` |
| Blog theme | The default theme is for docs. A blog uses a custom theme | [Yun](/themes/yun) for a blog. [Press](/themes/press) when the same site should read as docs | Landscape ships with `hexo init`. The Chinese catalog is larger, and those themes do not run on Valaxy |

Valaxy keeps the date, tags, and categories in post front matter, and the theme renders the list. See [Posts](/guide/post) and [Why Valaxy](/guide/why).

## When to stay on VitePress

Stay when the site is a library or product manual. The default docs theme is the product, and a post list, tags, archives, and a feed are not. A standalone manual stays on VitePress.

## When to use Valaxy

Use Valaxy when those blog pieces are the product, or when you are leaving Hexo and can accept a new theme. Start with [`pnpm create valaxy`](/guide/getting-started) and [Yun](/themes/yun). From Hexo, copy `source/_posts` to `pages/posts` and follow [Migration](/migration/).

Use [Press](/themes/press) for a docs-shaped site that still has Valaxy's posts, tags, addons, and Vue component overrides. Press is inspired by VitePress. Configuration lives in `valaxy.config.ts`, `site.config.ts`, or `theme.config.ts`. See [Migrating from VitePress](/themes/press/migration).

## Where Hexo still fits

Stay on Hexo when one Hexo theme or plugin is the product and replacing it is unacceptable. Move when you want Vue, Vite hot reload, and typed `valaxy.config.ts` / `site.config.ts`, and a new theme is acceptable. [Why Valaxy](/guide/why) and [How to choose](/guide/choose) cover that trade-off.
