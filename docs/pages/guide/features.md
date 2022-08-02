---
title: Features
title_zh: 亮点
categories:
  - Guide
end: false
top: 98
---

首先，我们来介绍一下 Valaxy 有哪些便捷的特性。

## UnoCSS

> 内置的类 TailwindCSS 的工具类（基于 [UnoCSS](https://github.com/unocss/unocss)）。

如果你使用过 [TailwindCSS](https://tailwindcss.com/)，那么一定能迅速领会到它的便捷之处。

你可以在你的 Markdown 和 Vue 组件中肆无忌惮地使用它，而且最终它会被按需打包并加载。

譬如：

```md
这是一份 Markdown 内容。

<div class="bg-white text-blue shadow" p="4">
这是一份 Markdown 内容。
</div>
```

你可以迅速得到这样的效果：

<div class="bg-white text-blue shadow" p="4">
这是一份 Markdown 内容。
</div>

## Icones

> 海量的图标

你可以任意使用 [Icones](https://icones.js.org/) 中可搜索到的任意图标。

命名规范为 `i-${collection}-${name}`，例如 `i-ri-home-line`。

主题默认安装了 [RemixIcon](https://github.com/Remix-Design/RemixIcon)。

如果你需要其他集合下的图标，可以自行安装。如：

```bash
# collection 为对应的图标集名称，如 @iconify-json/ri
npm i @iconify-json/collection
```

被添加至 `config.unocss.safelist` 的图标名称将全部是热加载的！

## UI

### 代码高亮

基于 [Shiki](https://github.com/shikijs/shiki) 实现。
Valaxy 支持 `vue` 等语法高亮，拷贝代码，高亮其中某一行。

譬如：

```js {2}
const a = 1
const b = a
```

### 自定义主题色

你只需传入一个主题色，全局各处的色彩会动态进行计算得出最终的效果。

譬如我希望主题色是红色：

> `valaxy-theme-yun` 支持

```ts
// valaxy.config.ts
export default {
  themeConfig: {
    colors: {
      primary: 'red',
    },
  },
}
```

但不仅如此，其他主题同样可复用 Valaxy 默认提供的色彩及变量函数来快速构建自身。

> 更多请参见 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) 代码。

## File-based Routing {lang="en"}

## 基于文件的自动路由 {lang="zh-CN"}

Routes will be auto-generated for Vue files in this dir with the same file structure.
Check out [`vite-plugin-pages`](https://github.com/hannoeru/vite-plugin-pages) for more details.

## 构建

同时支持 SPA 与 SSG 两种方案。

### SSG

基于 [vite-ssg](https://github.com/antfu/vite-ssg) 实现

```bash
# SSG
npm run build:ssg
# valaxy build --ssg
```

### SPA

```bash
npm run build:spa
# valaxy build
```

## RSS

独立地 RSS 构建

```bash
npm run rss
# valaxy rss
```

## i18n in One Page {lang="en"}

## 单页 i18n {lang="zh-CN"}

More info see [i18n](/posts/i18n).

## KaTeX

::: zh-CN
KaTeX 已被默认支持并启用。
:::

::: en
Katex is enabled by default.
:::

```ts
// valaxy.config.ts
import { defineConfig } from 'valaxy'
export default defineConfig({
  features: {
    // disable katex
    katex: false
  }
})
```

- [KaTeX | 示例 - Example](/examples/katex)
