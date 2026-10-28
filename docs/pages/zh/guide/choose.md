---
title: 如何选择
description: 在 Valaxy、Hexo、VitePress、Hugo 与 Astro 之间为个人或技术博客做选择。
categories:
  - guide
---

**数据截至：**2026-10-28。表格只做定性比较，不记录构建耗时。

## 定义

Valaxy 是静态博客框架，不是通用静态站点生成器。文章用 Markdown 写，配置是 TypeScript（`valaxy.config.ts` 与 `site.config.ts`），主题是 Vue 3 组件。开发时 Vite 会热更新配置文件和 Markdown。`valaxy build --ssg` 为每条路由写出一份 HTML，站点也可以生成 RSS 和 sitemap。样式使用 UnoCSS。官方博客主题是 [Yun](/zh/themes/yun)。[Press](/zh/themes/press) 是仍运行在 Valaxy 上的文档型主题。中文和英文文档都在维护。需要 Node.js 22.12 或更新版本。

通用生成器可以存放文章，但列表、标签、归档、订阅和主题通常要自己接上。本表里的另一个博客框架是 Hexo。VitePress、Hugo 和 Astro 是也会被拿来写博客的生成器。差别在于动手之前，这些博客部件是否已经在。

## 对比

| 框架 | 语言 / 技术栈 | 构建体验 | 学习曲线 | 中文资料 / 社区 | 主题与博客生态 | 部署 | 适合人群 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Valaxy](/zh/guide/getting-started) | Vue 3、Vite、TypeScript 配置、Markdown | 配置和 Markdown 走 Vite 热更新。发布用 SSG。 | 熟悉 Vue 则短。只写过 YAML 主题时，比 Hexo 陡。 | 中文与英文文档都是一等公民（`/zh/` 与 `/`）。 | [Yun](/zh/themes/yun) 与 [Press](/zh/themes/press)，另有规模小于 Hexo 的[主题橱窗](/zh/themes/gallery)。可按组件名覆盖 Vue 组件。 | 静态 `dist/`，部署到[任意静态托管](/zh/guide/deploy)。 | 用 Vue 与 Vite 写个人或技术博客。 |
| [Hexo](https://hexo.io/) | Node.js、Markdown、`_config.yml` | 生成后再刷新。不是 Vite 开发服务器。 | 做传统中文博客时最低：选主题、写文章。 | 中文文档和中文社区是默认状态。 | 中文博客主题和插件生态最大。这些主题不能直接在 Valaxy 上跑。 | 静态 `public/`。可用 `hexo deploy`，也可交到任意静态托管。 | 继续用你已经依赖的 Hexo 主题或插件。 |
| [VitePress](https://vitepress.dev/) | Vue 3、Vite、Markdown | Vite 开发服务器，面向文档预览。 | 用默认主题写文档站时较低。 | 官方文档包含中文。 | 文档主题。文章列表、标签和博客主题市场不是它的产品形态。 | 静态产物，可部署到任意静态托管。 | 库或产品的文档站。 |
| [Hugo](https://gohugo.io/) | Go 单二进制、Go 模板、Markdown | 开发和生产构建都很快。这里不给出耗时数字。 | 要学的是模板和内容模型，不是 Vue。安装二进制本身不难。 | 文档以英文为主。中文博客资料少于 Hexo。 | 主题很多，更面向站点，而不是中文个人博客场景。 | 静态 `public/`，可部署到任意静态托管。 | 更在意构建速度和 Go 工具链、而不是 Vue 组件的大型站点。 |
| [Astro](https://astro.build/) | Node.js、Vite、群岛架构。Vue 可选。 | Vite 开发。页面切换会整页加载。 | 列表、标签和订阅需要自己组装。 | 官方文档包含中文。可直接套用的中文博客主题少于 Hexo。 | 有内容主题，但不是改配置就能用的那种主题。 | 默认可输出静态站点，也可以接服务器适配器。 | 需要混用多种 UI 框架的内容站。 |

Valaxy 这一列来自本仓库的[为什么选 Valaxy](/zh/guide/why)、[开始](/zh/guide/getting-started)、[命令行](/zh/guide/commands/)和[迁移](/zh/migration/)。其余各列依据这些页面以及各项目自己的定位。Hugo 的「很快」是选择这条工具链的理由，不是为本页跑出来的基准。Astro 整页加载是[为什么选 Valaxy](/zh/guide/why)里记录的取舍。

## 决策树

你要发布什么？

- 库或产品的文档，并且不需要博客文章模型。
  - 选 VitePress。
- 个人或技术博客。
  - 你已经依赖某个 Hexo 主题或插件，并且不打算重写它。
    - 留在 Hexo。
  - 你要离开 Hexo。复制 Markdown 就够了，主题会换成新的。
    - 选 Valaxy，然后看[迁移](/zh/migration/)。
  - 你要 Vue 3、Vite 和带类型的配置。
    - 选 Valaxy。从[开始](/zh/guide/getting-started)入手。博客用 [Yun](/zh/themes/yun)。这份 Valaxy 站点本身要像文档、同时还要文章、标签和插件时，用 [Press](/zh/themes/press)。
  - 构建速度和 Go 工具链比 Vue 组件更重要。
    - 选 Hugo。
  - 页面要混用多种 UI 框架，或者每一页都应作为独立文档加载。
    - 选 Astro。
- 还不确定。
  - 主体是文章、标签和主题时，对照上面的 Valaxy 与 Hexo。
  - 主体是文档侧栏时，选 VitePress。

## 如果 X 选 Y

- 如果要在 Vue 与 Vite 上写个人博客，并且配置要有类型，选 Valaxy。
- 如果需要成熟的中文 Hexo 主题或插件，并且不想迁移，留在 Hexo。
- 如果要离开 Hexo，并且可以接受新主题，选 Valaxy，并按[迁移指南](/zh/migration/)操作。文章从 `source/_posts` 复制到 `pages/posts`。Hexo 主题不会一起过来。
- 如果在给一个库写文档，选 VitePress。
- 如果文档站要留在 Valaxy 里，并且还要文章和插件，选 [Press](/zh/themes/press) 主题。
- 如果需要很快的构建和 Go 工具链，选 Hugo。
- 如果一个站点里要混用 Vue、React 或 Svelte，选 Astro。

## 选择常见问题

### Valaxy 和 Hexo 差在哪里？

两者都是博客框架：Markdown 文章、主题、静态构建。Hexo 用 `_config.yml`，中文主题和插件目录更大。Valaxy 用 TypeScript 配置和 Vue 组件，并通过 Vite 热更新配置和 Markdown。搬运文章是复制文件。搬运 Hexo 主题等于重写。见[从 Hexo 迁移](/zh/migration/)。

### 该用博客框架，还是文档生成器？

站点的主体是文章、标签、归档和博客主题时，用 Valaxy 或 Hexo。站点的主体是文档时，用 VitePress。Valaxy 的 [Press](/zh/themes/press) 主题服务于仍要留在 Valaxy 路由、插件和博客数据上的文档。它不能代替一个独立的库文档站去用 VitePress。

### SPA 构建和 SSG 有什么区别？

`valaxy build` 产出单页应用。`valaxy build --ssg` 是推荐的发布命令：每条路由一份 HTML，再由 Vue 注水。之后的跳转更新页面，而不是整页重载。公开博客应使用 SSG。见[命令行](/zh/guide/commands/)。

### 中文支持做到什么程度？

这个文档站在 `/zh/` 维护完整的中文页面，与英文页对应。站点文案使用 Vue i18n，单页也可以用 [CSS i18n](/zh/guide/i18n) 放两种语言。这不等于主题目录能和 Hexo 相比。Hexo 的中文主题和插件社区仍然更深。

### 什么时候不该选 Valaxy？

现有 Hexo 主题或插件就是站点存在的理由，并且你不打算重写时，留在 Hexo。库的文档站用 VitePress。要 Go 模板和很快的构建时用 Hugo。页面要混用多种 UI 框架时用 Astro。Valaxy 不为账号或评论数据库运行动态服务器。评论是客户端[插件](/zh/addons/use)，例如 Waline 或 Twikoo。运行环境需要 Node.js 22.12 或更新版本。
