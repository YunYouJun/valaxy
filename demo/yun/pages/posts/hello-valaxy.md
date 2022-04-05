---
title: Hello, Valaxy!
date: 2022-03-22
updated: 2022-03-23
categories: Valaxy Notes
tags:
  - valaxy
  - 笔记
top: 1
---

## What is Valaxy?

Valaxy 的目标是成为新一代的静态博客框架/生成器。

## Why Valaxy?

构想新一代静态博客框架/生成器。

<!-- more -->

「告诉你两件好事吧」，第一它与 Hexo 相比开发体验和速度上都更胜一筹，第二它与 VitePress/VuePress 相比拥有更多针对博客的集成功能，譬如文章列表钩子、自动路由与组件注册、可覆盖的布局与主题等。

一味地讲述 Valaxy 的优点似乎有些难以理解。

我将会把 Valaxy 与现有的 Hexo（流行的静态博客框架）与 VitePress/VuePress（流行的静态站点生成器）进行对比，并阐述 Valaxy 相比它们的优势。

```ts
import type { UserConfig } from 'valaxy'
import type { ThemeUserConfig } from 'valaxy-theme-yun'

/**
 * User Config
 * do not use export const, because c12 will set as child property
 */
const config: UserConfig<ThemeUserConfig> = {
  theme: 'yun',

  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },
}

export default config
```

配置、文章热更新

而不是像 hexo 一样重新加载页面

### Motivation

- Slidev
- VitePress
- Vitesse

## Why not ...?

### Hexo/Hugo

### Vuepress/Vitepress

### iles

- [iles](https://github.com/ElMassimo/iles)

在完成了 Valaxy 基础结构的开发后，我从群友处得知了 iles，这和我实现的许多功能十分相似。

它相比 Vitepress 拥有更多功能，也很适合写一个拥有更多交互的文档。

不过它的定位仍旧是静态站点生成器，这与 Valaxy 静态博客生成器的定位不同。

因为 Valaxy 除此之外，还会提供文章列表、分页、标签、分类等更多面向博客的功能，并支持扩展与自定义博客主题。
