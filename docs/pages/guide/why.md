---
cover: https://cos.yunle.fun/images/bg/girl-in-water-tank.webp
title: Why Valaxy
date: 2022-03-22
categories:
  - getting-started
tags:
  - valaxy
  - 笔记
top: 100
---

## What is Valaxy?

Valaxy aims to be a next generation of static blogging frameworks/generators.


::: info

- V + galaxy = Valaxy
  - V: it based on vue + vite
  - galaxy: I hope it can be like a platform tool, hosting everyone's blog, as beautiful as the galaxy

:::

My blog was previously built on Hexo, but as modern front-end frameworks continue to advance, Hexo's workflow and development experience have begun to lag behind.
So I decided to build a new [hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun/) based on Vue and Vite.

My previous intention was to refactor the theme using a modern front-end framework, but the separation from Hexo also meant that I had to redo some of the rendering work that Hexo itself had done. So if I do that, why not develop a static site generator for blogs by the way? So I decided to call it Valaxy.

Is this a reinventing the wheel? I don't think so.


## Why Valaxy?


Next Generation Static Blog Framework/Generator

<!-- more -->

「Two things to tell you」, first, compared with Hexo, Valaxy is superior in both development experience and speed, second, compared with VitePress/VuePress, Valaxy has more integration features for blogs, such as article list hook, automatic routing and component registration, overlay layout and theme, etc.

It seems hard to understand the advantages of Valaxy.

I will compare Valaxy with the existing Hexo (popular static blog framework) and vitepress / vuepress (popular static site generator), and explain the advantages of Valaxy.

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

## Why not ...?


> Wordpress/Typecho, etc. are dynamic blogs that require additional server support. Their features and target audience are quite different, so they are not included in the comparison.


### [Hexo](https://hexo.io/)/[Hugo](https://gohugo.io/)/[Jekyll](https://jekyllrb.com/)


I badly need the HMR and PJAX development experience that modern front-end frameworks provide, as well as TypeScript's type hints, but Hexo seems to have gotten a little stuck in the past, and doing something based on it would be limiting.

Hugo is also a great static site generator, but I have no need to use Go. Of course, the ESBuild used in packaging is based on the Go implementation. But that's not for me to worry about.

Jekyll is a bit of a veteran, but again I don't use Ruby, and it doesn't seem to be easy, and there are some issues with the development experience. The fact that GitHub has native support for it is a big advantage, but I intend to use GitHub Actions to achieve a nearly consistent experience in this regard.


<!-- 最后，我有一些尝试想要实现。见[重新构想博客框架(Todo)]。
譬如，可以提供一种主题商店，用户仅需在 GitHub Repo 中存放自己的文章。
在主题商店，填写自己的 Repo 地址，选中主题切换即可在线预览内容效果。（这完全可以做到，只需要动态纯前端获取 Markdown 内容并渲染即可）
而用户想要应对 SEO 时，则可再将其渲染为静态页面。我也将会为此提供一个一键可用的 GitHub Actions 脚本。 -->

### VuePress/VitePress


[VitePress](https://vitepress.dev/)  is almost the successor to VuePress.

VitePress is a great static site generator, which is built for documentation, but lacks some convenient customization features for blogs, such as RSS, file automatic routing (vue-router), plugin (widget) mechanism, article list/category/tag hooks, custom override layout, override components, single-page switching i18n, KaTeX, etc.


### [iles](https://github.com/ElMassimo/iles)


After completing the development of Valaxy's basic structures, I learned about iles from my group friend, which is very similar to many features I have archived.

It has more features than Vitepress and is also suitable for writing a document with more interaction.

However, its positioning is still static site generator, which is different from that of Valaxy static blog generator.

In addition, Valaxy also provides more blog oriented features such as article list, pagination, tag and category, and supports extension and customization of blog topics.

### [Astro](https://astro.build/)


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


## Thanks


The implementation of Valaxy is based on or referenced from the following projects:


- [Vue](https://github.com/vuejs/core)
- [VueUse](https://github.com/vueuse/vueuse)
- [Vite](https://github.com/vitejs/vite)
- [VitePress](https://github.com/vuejs/vitepress)
- [Vitesse](https://github.com/antfu/vitesse)
- [Slidev](https://github.com/slidevjs/slidev)
