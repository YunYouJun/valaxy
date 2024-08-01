---
cover: https://cdn.yunyoujun.cn/img/bg/girl-in-water-tank.webp
title: Hello, Valaxy!
date: 2022-03-22
updated: 2022-03-23 19:00:00
categories: Valaxy Notes
tags:
  - valaxy
  - 笔记
top: 1
outline: deep
excerpt: Valaxy aims to be a next generation of static blogging frameworks/generators.
pageTitleClass: 'text-4xl text-red'
---

```md
{{ frontmatter }}
```

{{ frontmatter }}

## What is Valaxy? {lang="en"}

::: en
Valaxy aims to be a next generation of static blogging frameworks/generators.
:::

## 什么是 Valaxy? {lang="zh-CN"}

::: zh-CN
Valaxy 的目标是成为新一代的静态博客框架/生成器。
:::

More info see [valaxy.site](https://valaxy.site).

```ts
/**
 * User Config
 * do not use export const, because c12 will set as child property
 */
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

---

Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.

[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.
