---
title: 静态博客框架怎么选：Valaxy、Hexo、VitePress、Hugo、Astro 对比
description: 静态博客框架怎么选：Valaxy 为一个 Vue 博客提供的能力，以及 Hexo、VitePress、Hugo、Astro 仍适合的情况。
ogImage: /images/choose-og.png
categories:
  - guide
---

静态博客框架把 Markdown 文章发布成带列表、标签、归档和主题的站点。这一页比较 Valaxy、Hexo、VitePress、Hugo 和 Astro。

**数据截至：**2026-10-28。表格只做定性比较，不记录构建耗时。

## Valaxy 适合你，如果…

你要写个人或技术博客，并且需要这些能力：

1. **配置和 Markdown 都走 Vite 热更新。** 保存 `valaxy.config.ts`、`site.config.ts` 或一篇文章，预览就会更新。见[特性](/zh/guide/features)。
2. **TypeScript 配置带类型。** `valaxy.config.ts` 和 `site.config.ts` 在编辑器里有提示。Hexo 用 `_config.yml`。
3. **面向博客的文章能力。** 标签、分类、分页、RSS 和 sitemap 随框架提供。VitePress 为文档打造。见[为什么选 Valaxy](/zh/guide/why)。
4. **主题的 Vue 组件和布局可以覆盖。** 按名字替换布局或组件。博客主题是 [Yun](/zh/themes/yun)。文档形态的主题是 [Press](/zh/themes/press)。见[自定义组件](/zh/guide/custom/components)。
5. **先 SSG，再以 SPA 方式站内跳转。** `valaxy build --ssg` 为每条路由写出一份 HTML。页面加载之后，站内移动不会整页重载。Astro 默认的静态输出会重载。见[为什么选 Valaxy](/zh/guide/why)和[命令行](/zh/guide/commands/)。
6. **中文文档和 Hexo 迁移路径。** `/zh/` 是完整文档树，不是补译。文章从 Hexo 的 `source/_posts` 复制到 `pages/posts`。见[迁移](/zh/migration/)。
7. **插件，加上 Yun 和 Press。** 评论、搜索和相册是[插件](/zh/addons/use)。博客这条链路不用自己拼。

```bash
pnpm create valaxy
```

然后看[开始](/zh/guide/getting-started)。设计说明在[为什么选 Valaxy](/zh/guide/why)。要离开 Hexo，并且可以接受新主题？用[迁移](/zh/migration/)和 [Yun](/zh/themes/yun)。

## 定义

在这组对比里，Valaxy 是 Vue 3 与 Vite 的博客框架。通用生成器可以存放 Markdown，但列表、标签、归档、订阅和主题通常要自己接上。另一个博客框架是 Hexo。VitePress、Hugo 和 Astro 是也会被拿来写博客的生成器。需要 Node.js 22.12 或更新版本。

## 对比

| 框架 | 语言 / 技术栈 | 构建体验 | 学习曲线 | 中文资料 / 社区 | 主题与博客生态 | 部署 | 适合人群 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Valaxy](/zh/guide/getting-started) | Vue 3、Vite、带类型的 `valaxy.config.ts` 与 `site.config.ts`、Markdown | 配置和 Markdown 走 Vite 热更新。发布用 SSG，之后站内以 SPA 方式跳转。 | 写 Vue 的人从 `pnpm create valaxy` 开始。定制就是写 Vue 组件。 | 中英文文档都完整（`/zh/` 与 `/`），并带[Hexo 迁移指南](/zh/migration/)。 | [Yun](/zh/themes/yun)、[Press](/zh/themes/press) 和[插件](/zh/addons/use)。主题目录小于 Hexo。用覆盖 Vue 组件代替等待移植。 | 静态 `dist/`，部署到[任意静态托管](/zh/guide/deploy)。 | 用 Vue 写的个人或技术博客，也包括可以接受新主题时从 Hexo 迁出。 |
| [Hexo](https://hexo.io/) | Node.js、Markdown、`_config.yml` | 生成后再刷新。配置和文章没有 Vite 热更新。 | 只挑选现成主题、并且不写 Vue 时，这条路最短。 | 中文文档和中文社区是默认状态。 | 中文博客主题和插件目录最大。这些主题不能直接在 Valaxy 上跑。 | 静态 `public/`。可用 `hexo deploy`，也可交到任意静态托管。 | 仅当某一个 Hexo 主题或插件就是产品，并且你不会替换它。 |
| [VitePress](https://vitepress.dev/) | Vue 3、Vite、Markdown | Vite 开发服务器，面向文档预览。导航是文档站，不是博客 SPA。 | 用默认主题写文档站时较低。博客部件需要自己加。 | 官方文档包含中文。 | 文档主题。文章列表、标签、RSS 和博客主题市场不是它的产品形态。 | 静态产物，可部署到任意静态托管。 | 库或产品的文档站，并且不需要博客文章模型。 |
| [Hugo](https://gohugo.io/) | Go 单二进制、Go 模板、Markdown | 开发和生产构建都很快。这里不给出耗时，也不与 Valaxy 比数字。 | 要学的是模板和内容模型，不是 Vue。 | 文档以英文为主。中文博客资料少于 Hexo。 | 站点主题很多。更少面向中文个人博客，也不是 Vue 组件主题。 | 静态 `public/`，可部署到任意静态托管。 | 更在意 Go 工具链、而不是 Vue 组件的大型站点。 |
| [Astro](https://astro.build/) | Node.js、Vite、群岛架构。Vue 可选。 | Vite 开发。默认静态导航会整页重载。 | 列表、标签、订阅和主题需要自己组装。 | 官方文档包含中文。可直接套用的中文博客主题少于 Hexo。 | 有内容主题。不是带 Yun 那种组件覆盖的博客框架。 | 默认可输出静态站点，也可以接服务器适配器。 | 需要混用多种 UI 框架的内容站。 |

Valaxy 这一列来自本仓库的[为什么选 Valaxy](/zh/guide/why)、[开始](/zh/guide/getting-started)、[特性](/zh/guide/features)、[命令行](/zh/guide/commands/)和[迁移](/zh/migration/)。Hugo 的「很快」是选择那条工具链的理由，不是相对 Valaxy 的基准。Astro 整页加载是[为什么选 Valaxy](/zh/guide/why)里记录的取舍。

## 决策树

你要发布什么？

- 个人或技术博客，并且你要 Vue 与 Vite；或者你要离开 Hexo，并且可以接受新主题。
  - 选 Valaxy。[开始](/zh/guide/getting-started)。来自 Hexo 时按[迁移](/zh/migration/)。博客用 [Yun](/zh/themes/yun)。这份 Valaxy 站点要像文档、同时还要文章、标签和插件时，用 [Press](/zh/themes/press)。
- 某一个 Hexo 主题或插件就是产品，并且你不会替换它。
  - 留在 Hexo。这是主题锁定，不是避开 Valaxy 的一般理由。
- 库或产品的文档，并且不需要博客文章模型。
  - 选 VitePress。文档要留在 Valaxy 上时，改用 [Press](/zh/themes/press)。
- Go 工具链比 Vue 组件更重要。
  - 选 Hugo。本页不声称 Valaxy 构建更快。
- 页面要混用多种 UI 框架，或者每一页都应作为独立文档加载。
  - 选 Astro。

## 如果 X 选 Y

- 如果要在 Vue 与 Vite 上写个人博客，并且配置要有类型，选 Valaxy 并[开始](/zh/guide/getting-started)。
- 如果要离开 Hexo，并且可以接受新主题，选 Valaxy，并按[迁移](/zh/migration/)操作。文章从 `source/_posts` 复制到 `pages/posts`。Hexo 主题不会一起过来。
- 如果某一个 Hexo 主题或插件就是产品，并且你不会替换它，留在 Hexo。
- 如果在给一个库写文档，并且不需要文章、标签或 RSS，选 VitePress。
- 如果文档站要留在 Valaxy 里，并且还要文章和插件，选 [Press](/zh/themes/press) 主题。
- 如果需要 Go 工具链和很快的构建，选 Hugo。
- 如果一个站点里要混用 Vue、React 或 Svelte，选 Astro。

## 什么时候不选 Valaxy {#when-not-valaxy}

这些情况不要选 Valaxy：

- 某一个 Hexo 主题或插件就是产品，并且不能替换。否则就迁移。
- 站点只是一份库手册。用 VitePress。
- 你要 Go 模板，并且这条工具链的构建速度就是要求。本页不发布 Valaxy 与 Hugo 的耗时对比。
- 页面必须混用一种以上的 UI 框架。用 Astro。
- 你需要动态服务器来做账号。评论是客户端[插件](/zh/addons/use)，例如 Waline 或 Twikoo。
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
