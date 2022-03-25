---
title: Hello, Valaxy!
date: 2022-03-22
updated: 2022-03-23
category: Valaxy 笔记
tags:
  - valaxy
  - 笔记
---

## Why Valaxy?

构想新一代静态博客框架/生成器。

<!-- more -->

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

## Why not ...?

### Hexo/Hugo

### Vuepress/Vitepress

### iles

- [iles](https://github.com/ElMassimo/iles)

在完成了 Valaxy 基础结构的开发后，我从群友处得知了 iles，这和我实现的许多功能十分相似。

它相比 Vitepress 拥有更多功能，也很适合写一个拥有更多交互的文档。

不过它的定位仍旧是静态站点生成器，这与 Valaxy 静态博客生成器的定位不同。

因为 Valaxy 除此之外，还会提供文章列表、分页、标签、分类等更多面向博客的功能，并支持扩展与自定义博客主题。
