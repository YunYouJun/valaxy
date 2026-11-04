---
title: VitePress 能做博客吗？
description: VitePress 能做博客吗？典型博客还要自己补什么，以及和 Valaxy、Hexo 的差别。
categories:
  - guide
---

可以，但有前提。[VitePress](https://vitepress.dev/zh/guide/what-is-vitepress) 能做博客。它自己的文档把博客和文档并列为使用场景，并举 Vue.js 官方博客为例：自定义主题，再根据本地 Markdown 生成索引。默认主题仍是技术文档主题。典型博客的文章列表、标签页、归档、RSS 和博客主题并不自带，需要自己组装并维护。[Valaxy](/zh/guide/getting-started) 是 Vue 博客框架，这些能力随框架提供。[Hexo](https://hexo.io/) 也是博客框架：`hexo init` 生成的站点自带文章索引、标签、分类、归档和博客主题，订阅源则是另装的官方插件。这一页只做定性比较。Hugo 和 Astro 的选择见[静态博客框架怎么选](/zh/guide/choose)。

::: tip
文档核对截至 2026-11-05（Asia/Shanghai）。只做定性比较。
:::

## 典型博客还要自己补什么

| 需要 | VitePress | Valaxy | Hexo |
| --- | --- | --- | --- |
| 文章列表 | 自己做索引，Vue.js 博客就是这样做的 | 来自 `pages/posts` | `hexo init` 已包含 |
| 标签和分类 | 自己做页面 | [标签和分类布局](/zh/guide/layout) | `hexo init` 已包含 |
| 归档 | 自己做页面 | [归档布局](/zh/guide/layout) | `hexo init` 已包含 |
| RSS | 自己加订阅源 | 内置，设好 `url` 后默认开启（[RSS](/zh/guide/features#rss)） | 官方插件 [`hexo-generator-feed`](https://github.com/hexojs/hexo-generator-feed)，不在 `hexo init` 里 |
| 博客主题 | 默认主题为文档设计。博客要换自定义主题 | 博客用 [Yun](/zh/themes/yun)。同一站点要像文档时用 [Press](/zh/themes/press) | `hexo init` 带 Landscape。中文主题目录更大，这些主题不能在 Valaxy 上跑 |

Valaxy 把日期、标签和分类放在文章 front matter 里，由主题渲染列表。见[文章](/zh/guide/post)和[为什么选 Valaxy](/zh/guide/why)。

## 什么时候留在 VitePress

站点是库或产品手册时留在 VitePress。默认文档主题才是产品，文章列表、标签、归档和订阅源不是。独立的手册继续用 VitePress。

## 什么时候用 Valaxy

这些博客部件就是产品，或者要离开 Hexo 并且可以接受新主题时，用 Valaxy。从 [`pnpm create valaxy`](/zh/guide/getting-started) 和 [Yun](/zh/themes/yun) 开始。来自 Hexo 时，把 `source/_posts` 复制到 `pages/posts`，按[迁移](/zh/migration/)走。

想要一个像 VitePress 的文档站，同时又要 Valaxy 的文章、标签、插件和 Vue 组件覆盖，用 [Press](/zh/themes/press)。Press 的交互受 VitePress 启发。配置写在 `valaxy.config.ts`、`site.config.ts` 或 `theme.config.ts`。见[从 VitePress 迁移](/zh/themes/press/migration)。

## Hexo 仍然适合的地方

某一个 Hexo 主题或插件就是产品，并且不能替换时，留在 Hexo。想要 Vue、Vite 热更新，以及带类型的 `valaxy.config.ts` / `site.config.ts`，并且可以接受新主题时，再迁。这个取舍写在[为什么选 Valaxy](/zh/guide/why)和[怎么选](/zh/guide/choose)。
