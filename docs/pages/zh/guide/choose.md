---
title: 静态博客框架怎么选：Valaxy、Hexo、VitePress、Hugo、Astro 对比
description: 静态博客框架怎么选：Valaxy 为一个 Vue 博客提供的能力，以及 Hexo、VitePress、Hugo、Astro 仍适合的情况。
ogImage: /images/choose-og.png
categories:
  - guide
---

静态博客框架把 Markdown 文章发布成带列表、标签、归档和主题的站点。这一页比较 Valaxy、Hexo、VitePress、Hugo 和 Astro。

::: tip
数据截至 2026-10-28。只做定性比较，不记录构建耗时。
:::

## Valaxy 适合你，如果…

你要写 Vue 博客，或者要离开 Hexo，并且可以接受新主题。

- **配置和文章都走 Vite 热更新。** 见[特性](/zh/guide/features)。
- **带类型的** `valaxy.config.ts` 和 `site.config.ts`。Hexo 用 `_config.yml`。
- **标签、归档、RSS 和 sitemap** 随框架提供。VitePress 为文档打造。见[为什么选 Valaxy](/zh/guide/why)。
- **主题按 Vue 组件覆盖。** 博客用 [Yun](/zh/themes/yun)。同一站点要像文档时用 [Press](/zh/themes/press)。见[自定义组件](/zh/guide/custom/components)。
- **先 SSG，再站内跳转。** `valaxy build --ssg` 为每条路由写一份 HTML。之后的点击不会整页重载。见[命令行](/zh/guide/commands/)。
- **完整的中文文档树**在 `/zh/`，文章从 Hexo 的 `source/_posts` 复制到 `pages/posts`。见[迁移](/zh/migration/)。
- **插件**负责评论、搜索和相册。见[插件](/zh/addons/use)。

```bash
pnpm create valaxy
```

[开始](/zh/guide/getting-started)。来自 Hexo 时，按[迁移](/zh/migration/)并用 [Yun](/zh/themes/yun)。需要 Node.js 22.12 或更新版本。

## 对比

<ChooseCompare lang="zh" />

依据[为什么选 Valaxy](/zh/guide/why)、[开始](/zh/guide/getting-started)、[特性](/zh/guide/features)、[命令行](/zh/guide/commands/)和[迁移](/zh/migration/)。Hugo 很快是选择 Go 的理由，不是相对 Valaxy 的基准。

## 决策树

你要发布什么？

- **用 Vue 写的个人或技术博客**，或者可以接受新主题时离开 Hexo。选 Valaxy。[开始](/zh/guide/getting-started)。来自 Hexo 时按[迁移](/zh/migration/)。博客用 [Yun](/zh/themes/yun)。这份 Valaxy 站点要像文档、并且要文章、标签和插件时，用 [Press](/zh/themes/press)。
- **某一个 Hexo 主题或插件就是产品**，并且你不会替换它。留在 Hexo。这是主题锁定。
- **库或产品的文档**，并且不需要博客文章模型。选 VitePress。文档要留在 Valaxy 上时，用 [Press](/zh/themes/press)。
- **Go 工具链**比 Vue 组件更重要。选 Hugo。本页不声称 Valaxy 构建更快。
- **页面要混用多种 UI 框架**，或者每一页都应作为独立文档加载。选 Astro。

## 什么时候不选 Valaxy {#when-not-valaxy}

- 某一个 Hexo 主题或插件就是产品，并且不能替换。
- 站点只是一份库手册。用 VitePress。
- 你要 Go 模板，并且这条工具链的构建速度就是要求。本页不发布 Valaxy 与 Hugo 的耗时对比。
- 页面必须混用一种以上的 UI 框架。用 Astro。
- 你需要服务器上的账号。评论是客户端[插件](/zh/addons/use)，例如 Waline 或 Twikoo。
- Node.js 旧于 22.12。

## 选择常见问题

### Valaxy 和 Hexo 差在哪里？

两者都是博客框架：Markdown 文章、主题、静态构建。对写 Vue 的人，Valaxy 有 Vite 热更新、带类型的 `valaxy.config.ts` / `site.config.ts`，以及按 Vue 组件覆盖的主题。Hexo 的中文主题目录仍然更大。可以接受新主题就迁：复制文章，然后用 [Yun](/zh/themes/yun)。只有那个现成主题或插件就是产品时，才留在 Hexo。见[迁移](/zh/migration/)。

### 该用博客框架，还是文档生成器？

站点的主体是文章、标签、归档和博客主题时，用 Valaxy。只有站点就是文档、那些博客部件不是产品时，VitePress 更合适。[Press](/zh/themes/press) 把文档形态留在 Valaxy 上，包括文章和插件。它不能代替一个独立的库手册去用 VitePress。

### SPA 构建和 SSG 有什么区别？

`valaxy build` 产出单页应用。发布应使用 `valaxy build --ssg`：每条路由一份 HTML，再由 Vue 注水。之后的跳转更新页面，而不是整页重载。这种站内导航就是和 Astro 默认静态输出的差别，写在[为什么选 Valaxy](/zh/guide/why)。见[命令行](/zh/guide/commands/)。

### 中文支持做到什么程度？

这个文档站在 `/zh/` 维护完整的中文页面，与英文页对应。站点文案使用 Vue i18n，单页也可以用 [CSS i18n](/zh/guide/i18n) 放两种语言。Hexo 文章按[中文迁移指南](/zh/migration/)搬。Hexo 的主题和插件社区仍然更深。Valaxy 的中文文档是一等的，主题目录没有那么大，所以组件覆盖才重要。

### 什么时候不该选 Valaxy？

看[什么时候不选 Valaxy](#when-not-valaxy)。短的说法：只在主题锁定时留在 Hexo，库手册用 VitePress，要点是 Go 工具链时用 Hugo，一个站点要混用多种 UI 框架时用 Astro。

<ChooseFaqJsonLd lang="zh" />
