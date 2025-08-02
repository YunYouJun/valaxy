---
cover: https://cos.yunle.fun/images/bg/girl-in-water-tank.webp
title:
  en: Why Valaxy
  zh-CN: 为什么选 Valaxy
date: 2022-03-22
categories:
  - getting-started
tags:
  - valaxy
  - 笔记
top: 100
---

## What is Valaxy? {lang="en"}

::: en
Valaxy aims to be a next generation of static blogging frameworks/generators.
:::

## 什么是 Valaxy? {lang="zh-CN"}

::: zh-CN
Valaxy 的目标是成为新一代的静态博客框架/生成器。
:::

<div lang="zh-CN">

::: info

- V + galaxy = Valaxy
  - V: it based on vue + vite
  - galaxy: 我希望它可以像一个平台工具，承载每个人的博客，如同银河系一般美丽

:::

我的博客此前构建于 Hexo 之上，但随着现代前端框架的不断进步，Hexo 的工作流与开发体验已开始落后。
因此我决定基于 Vue 与 Vite 构建新的 [hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun/)。

此前我的目的是使用现代前端框架重构主题，但与 Hexo 的脱离也意味着我要重新完成 Hexo 本身做的一些渲染工作。
那么如果我这么做了，为什么不顺便开发一个专为博客打造的静态站点生成器呢？
因此，我决定将其叫做 Valaxy。

这是重复造轮子吗？我认为不是。

</div>

<div lang="en">

::: info

- V + galaxy = Valaxy
  - V: it based on vue + vite
  - galaxy: I hope it can be like a platform tool, hosting everyone's blog, as beautiful as the galaxy

:::

My blog was previously built on Hexo, but as modern front-end frameworks continue to advance, Hexo's workflow and development experience have begun to lag behind.
So I decided to build a new [hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun/) based on Vue and Vite.

My previous intention was to refactor the theme using a modern front-end framework, but the separation from Hexo also meant that I had to redo some of the rendering work that Hexo itself had done. So if I do that, why not develop a static site generator for blogs by the way? So I decided to call it Valaxy.

Is this a reinventing the wheel? I don't think so.

</div>

## 为什么是 Valaxy? {lang="zh-CN"}

::: zh-CN

构想新一代静态博客框架/生成器。

<!-- more -->

「**告诉你两件好事吧**」：

- 第一它与 Hexo 相比开发体验和速度上都更胜一筹
- 第二它与 VitePress/VuePress 相比拥有更多针对博客的集成功能，譬如文章列表钩子、自动路由与组件注册、可覆盖的布局与主题等。

我认为 Valaxy 最突出的优势在于它的热更新开发体验与可定制性，但你编写文章或博客配置时，你只需要保存，所有的变更将会即刻显示在页面上，几乎无需等待！

此外，Valaxy 的主题还较少，但以 valaxy-theme-yun 为例，你可以覆盖主题中的**任何**组件，来定制或编写你自己的主题。

一味地讲述 Valaxy 的优点似乎有些难以理解。

我将会把 Valaxy 与现有的 Hexo（流行的静态博客框架）与 VitePress/VuePress（流行的静态站点生成器）进行对比，并阐述 Valaxy 的优势。

:::

## Why Valaxy? {lang="en"}

::: en

Next Generation Static Blog Framework/Generator

<!-- more -->

「Two things to tell you」, first, compared with Hexo, Valaxy is superior in both development experience and speed, second, compared with VitePress/VuePress, Valaxy has more integration features for blogs, such as article list hook, automatic routing and component registration, overlay layout and theme, etc.

It seems hard to understand the advantages of Valaxy.

I will compare Valaxy with the existing Hexo (popular static blog framework) and vitepress / vuepress (popular static site generator), and explain the advantages of Valaxy.
:::

```ts
import type { UserConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },
})
```

## Why not ...? {lang="en"}

## 为什么不是……？ {lang="zh-CN"}

::: zh-CN

> Wordpress/Typecho 等属于动态博客，需要额外的服务器支持。它们的特性与目标群体差异较大，因此不在对比范围内。

:::

::: en

> Wordpress/Typecho, etc. are dynamic blogs that require additional server support. Their features and target audience are quite different, so they are not included in the comparison.

:::

### [Hexo](https://hexo.io/)/[Hugo](https://gohugo.io/)/[Jekyll](https://jekyllrb.com/)

::: zh-CN

我非常需要现代前端框架提供的开发热重载与 PJAX 体验，以及 TypeScript 的类型提示，但 Hexo 似乎已经有些积重难返，基于此来做一些工作将会束手束脚。

Hugo 也是很棒的静态站点生成器，但是我并没有使用 Go 的需求。当然在打包时所使用的 ESBuild 正是基于 Go 实现。但这并不需要我操心。

Jekyll 算是元老，但同样我并不使用 Ruby，且它似乎并不便捷，也同样存在一些开发体验的问题。
GitHub 为其提供了原生支持是一大优势，但我打算类似使用 GitHub Actions 来达成该方面近乎一致的体验。

:::

::: en

I badly need the HMR and PJAX development experience that modern front-end frameworks provide, as well as TypeScript's type hints, but Hexo seems to have gotten a little stuck in the past, and doing something based on it would be limiting.

Hugo is also a great static site generator, but I have no need to use Go. Of course, the ESBuild used in packaging is based on the Go implementation. But that's not for me to worry about.

Jekyll is a bit of a veteran, but again I don't use Ruby, and it doesn't seem to be easy, and there are some issues with the development experience. The fact that GitHub has native support for it is a big advantage, but I intend to use GitHub Actions to achieve a nearly consistent experience in this regard.

:::

<!-- 最后，我有一些尝试想要实现。见[重新构想博客框架(Todo)]。
譬如，可以提供一种主题商店，用户仅需在 GitHub Repo 中存放自己的文章。
在主题商店，填写自己的 Repo 地址，选中主题切换即可在线预览内容效果。（这完全可以做到，只需要动态纯前端获取 Markdown 内容并渲染即可）
而用户想要应对 SEO 时，则可再将其渲染为静态页面。我也将会为此提供一个一键可用的 GitHub Actions 脚本。 -->

### VuePress/VitePress

::: zh-CN

[VitePress](https://vitepress.dev/) 几乎已成为了 VuePress 的继任者。

VitePress 是一个很棒的静态站点生成器，它为文档打造，但缺少一些针对博客的定制便捷功能。
如：RSS、文件自动路由（vue-router）、插件（挂件）机制、文章列表/分类/标签钩子、自定义覆盖布局、覆盖组件、单页切换的 i18n、KaTeX 等。

:::

::: en

[VitePress](https://vitepress.dev/)  is almost the successor to VuePress.

VitePress is a great static site generator, which is built for documentation, but lacks some convenient customization features for blogs, such as RSS, file automatic routing (vue-router), plugin (widget) mechanism, article list/category/tag hooks, custom override layout, override components, single-page switching i18n, KaTeX, etc.

:::

### [iles](https://github.com/ElMassimo/iles)

::: zh-CN
iles 与 Valaxy 的一些基础结构功能很相似，它相比 Vitepress 拥有更多功能，也很适合写一个拥有更多交互的文档。

不过它的定位仍旧是静态站点生成器，这与 Valaxy 静态博客生成器的定位不同。它的维护似乎也逐渐陷入停滞。

因为 Valaxy 除此之外，还会提供文章列表、分页、标签、分类等更多面向博客的功能，并支持扩展与自定义博客主题。
:::

::: en
After completing the development of Valaxy's basic structures, I learned about iles from my group friend, which is very similar to many features I have archived.

It has more features than Vitepress and is also suitable for writing a document with more interaction.

However, its positioning is still static site generator, which is different from that of Valaxy static blog generator.

In addition, Valaxy also provides more blog oriented features such as article list, pagination, tag and category, and supports extension and customization of blog topics.
:::

### [Astro](https://astro.build/)

::: zh-CN

Astro 是一个内容驱动的 Web 框架。它相比 Valaxy 针对博客的定位拥有更多的泛用性。

> 得益于它的[群岛架构](https://docs.astro.build/zh-cn/concepts/islands/)，Astro 可以将任何前端框架（如 React、Vue、Svelte 等）与静态内容结合起来。

事实上，Valaxy 对于博客的构建与 Astro 是两种技术路线。

Valaxy 使用基于 Vue 的 Vite [SSG](https://cn.vuejs.org/guide/extras/ways-of-using-vue#jamstack-ssg)（静态站点生成）功能来构建博客，暂不考虑支持其他前端框架。
Valaxy 目前采用的是单页 SSG，它会为每个博客页面生成一个单独的 HTML 文件，而从任一入口进入后，除了当前页面内容的展示外，也会将其激活为 [SPA](https://cn.vuejs.org/guide/extras/ways-of-using-vue#single-page-application-spa)。
而在此之后它只需要部分地更新页面内容，而无需重新加载整个页面。

用比喻的话来说，Astro 的每个页面都是一个独立的岛屿，站点则是群岛。
而 Valaxy 的站点更像是一个整体的星球，每个页面都是进入星球的入口。

> - 我们可以打开 astro 的[文档官网](https://docs.astro.build/en/getting-started/)，并打开浏览器的开发者工具，取消勾选保留日志，随后切换左侧目录，并查看其网络请求。
> 此时你可以发现，每次切换页面时，Astro 都会重新加载整个页面，并产生新的请求，且左侧目录所处位置可能发生改变。
> - 你也可以打开 Valaxy 的[文档官网](https://valaxy.site/guide/getting-started)，并重复上述操作。
> 此时你会发现，Valaxy 在切换页面时并不会重新加载整个页面，而是仅加载部分脚本，并更新页面内容。
>
> 视频演示：[为什么不是 Astro？| #596](https://github.com/YunYouJun/valaxy/discussions/596)

这是两种架构的取舍，毫无意外，Astro 的首屏加载速度会更快，但切换页面时可能存在部分的体验中断。
而 Valaxy 的首屏加载速度介于 Astro 与传统的 SPA 之间，但切换页面时则可拥有 SPA 的体验。

:::

::: en

Astro is a content-driven web framework. It has more versatility than Valaxy's blog-oriented positioning.

> Thanks to its [islands architecture](https://docs.astro.build/en/concepts/islands/), Astro can combine any front-end framework (such as React, Vue, Svelte, etc.) with static content.

In fact, Valaxy and Astro are two different technical routes for building blogs.

Valaxy uses Vue-based Vite [SSG](https://vuejs.org/guide/extras/ways-of-using-vue#jamstack-ssg) (static site generation) to build blogs, and currently does not consider supporting other front-end frameworks.
Currently, Valaxy adopts a single-page SSG, which generates a separate HTML file for each blog page, and after entering from any entry point, it activates as a [SPA](https://vuejs.org/guide/extras/ways-of-using-vue#single-page-application-spa) while displaying the content of the current page.
After that, it only needs to update the page content partially without reloading the entire page.

In metaphorical terms, each page of Astro is an independent island, and the site is an archipelago.
Valaxy's site is more like a whole planet, with each page being an entry point to the planet. 

> - We can open the [Astro documentation website](https://docs.astro.build/en/getting-started/) and open the browser's developer tools, uncheck the "Preserve log" option, then switch to the left directory and check its network requests.
> At this point, you will find that Astro reloads the entire page and generates new requests every time you switch pages, and the position of the left directory may change.
> - You can also open the [Valaxy documentation website](https://valaxy.site/guide/getting-started) and repeat the above operation.
> At this point, you will find that Valaxy does not reload the entire page when switching pages, but only loads part of the scripts and updates the page content.
>
> Video demonstration: [Why not Astro? | #596](https://github.com/YunYouJun/valaxy/discussions/596)

This is a trade-off between two architectures. Unsurprisingly, Astro's first screen loading speed is faster, but there may be some experience interruptions when switching pages.
Valaxy's first screen loading speed is between Astro and traditional SPAs, but it provides a SPA-like experience when switching pages.

:::

## Thanks

::: zh-CN

💗 Valaxy 的实现基于或参考了以下项目：

:::

::: en

The implementation of Valaxy is based on or referenced from the following projects:

:::

- [Vue](https://github.com/vuejs/core)
- [VueUse](https://github.com/vueuse/vueuse)
- [Vite](https://github.com/vitejs/vite)
- [VitePress](https://github.com/vuejs/vitepress)
- [Vitesse](https://github.com/antfu/vitesse)
- [Slidev](https://github.com/slidevjs/slidev)
