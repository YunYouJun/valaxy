---
cover: https://fastly.jsdelivr.net/gh/YunYouJun/cdn/img/bg/girl-in-water-tank.webp
title: Why Valaxy
title_zh-CN: 为什么选 Valaxy
date: 2022-03-22
categories:
  - Getting Started
tags:
  - valaxy
  - 笔记
top: 100
end: false
---

## What is Valaxy? {lang="en"}

::: en
Valaxy aims to be a next generation of static blogging frameworks/generators.
:::

## 什么是 Valaxy? {lang="zh-CN"}

::: zh-CN
Valaxy 的目标是成为新一代的静态博客框架/生成器。
:::

::: info

- V + galaxy = Valaxy
  - V: it based on vue + vite
  - galaxy: 我希望它可以像一个平台工具，承载大家的博客，如同银河系一般美丽
  - xy: 有点像小云（Xiao Yun）的缩写（乌拉小云）
  - val: 瓦尔（基里）- 女武神

:::

我的博客此前构建于 Hexo 之上，但随着现代前端框架的不断进步，Hexo 的工作流与开发体验已开始落后。
因此我决定基于 Vue 与 Vite 构建新的 [hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun/)。

此前我的目的是使用现代前端框架重构主题，但与 Hexo 的脱离也意味着我要重新完成 Hexo 本身做的一些渲染工作。
那么如果我这么做了，为什么不顺便开发一个专为博客打造的静态站点生成器呢？
因此，我决定将其叫做 Valaxy。

这是重复造轮子吗？我认为不是。

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

> Wordpress/Typecho 等是动态博客，因此不在考虑范围内。

### [Hexo](https://hexo.io/)/[Hugo](https://gohugo.io/)/Jekyll

我非常需要现代前端框架提供的开发热重载与 PJAX 体验，以及 TypeScript 的类型提示，但 Hexo 似乎已经有些积重难返，基于此来做一些工作将会束手束脚。

Hugo 也是很棒的静态站点生成器，但是我并没有使用 Go 的需求。当然在打包时所使用的 ESBuild 正是基于 Go 实现。但这并不需要我操心。

Jekyll 算是元老，但同样我并不使用 Ruby，且它似乎并不便捷，也同样存在一些开发体验的问题。
GitHub 为其提供了原生支持是一大优势，但我打算类似使用 GitHub Actions 来达成该方面近乎一致的体验。

<!-- 最后，我有一些尝试想要实现。见[重新构想博客框架(Todo)]。
譬如，可以提供一种主题商店，用户仅需在 GitHub Repo 中存放自己的文章。
在主题商店，填写自己的 Repo 地址，选中主题切换即可在线预览内容效果。（这完全可以做到，只需要动态纯前端获取 Markdown 内容并渲染即可）
而用户想要应对 SEO 时，则可再将其渲染为静态页面。我也将会为此提供一个一键可用的 GitHub Actions 脚本。 -->

### VuePress/VitePress

[VitePress](https://vitepress.dev/) 几乎已成为了 VuePress 的继任者。

但 VitePress 是一个很棒的静态站点生成器，它为文档打造，但缺少一些针对博客的定制便捷功能。
如：RSS、文件自动路由（vue-router）、插件（挂件）机制、文章列表/分类/标签钩子、自定义覆盖布局、覆盖组件、单页切换的 i18n、KaTeX 等。

### [iles](https://github.com/ElMassimo/iles)

::: zh-CN
iles 与 Valaxy 的一些基础结构功能很相似，它相比 Vitepress 拥有更多功能，也很适合写一个拥有更多交互的文档。

不过它的定位仍旧是静态站点生成器，这与 Valaxy 静态博客生成器的定位不同。

因为 Valaxy 除此之外，还会提供文章列表、分页、标签、分类等更多面向博客的功能，并支持扩展与自定义博客主题。
:::

::: en
After completing the development of Valaxy's basic structures, I learned about iles from my group friend, which is very similar to many features I have archieved.

It has more features than Vitepress and is also suitable for writing a document with more interaction.

However, its positioning is still static site generator, which is different from that of Valaxy static blog generator.

In addition, Valaxy also provides more blog oriented features such as article list, pagination, tag and category, and supports extension and customization of blog topics.
:::

## Thanks

💗 Valaxy 的实现基于或参考了以下项目：

- [Vue](https://github.com/vuejs/core)
- [VueUse](https://github.com/vueuse/vueuse)
- [Vite](https://github.com/vitejs/vite)
- [VitePress](https://github.com/vuejs/vitepress)
- [Vitesse](https://github.com/antfu/vitesse)
- [Slidev](https://github.com/slidevjs/slidev)
