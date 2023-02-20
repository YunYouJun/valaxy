---
title: Features
title_zh-CN: 亮点
categories:
  - Getting Started
end: false
top: 98
---

::: zh-CN
首先，我们来介绍一下 Valaxy 有哪些便捷的特性。
:::

::: en
First, I'll introduce you to some easy 
:::

## 热更新 {lang="zh-CN"}

## Hot Reloading {lang="en"}

::: zh-CN
最值得一提的是，Valaxy 从配置到文章内容、动画到全局的标签、分类，全部都是支持热更新的！局部的！

譬如，你修改了 `valaxy.config.ts`/`site.config.ts` 或是 `xxx.md` 文章中的内容或 `frontmatter`（`tags`/`categories`）所有的变动会立刻显示在预览界面上，无需手动刷新。同时热更新也是局部的，它只变动有修改的地方，不会重新刷新整个页面。
:::

::: en
It's most worth mentioning that Valaxy supports partial hot reloading, for configuration, post contents,
animation, tags, categories, and much more!

For example, if you modified `valaxy.config.ts`/`site.config.ts`, the content in `xxx.md`, or `frontmatter`
(`tags`/`categories`), all changes will immediately appear on the preview page, and there is no need for manual
refreshing. Also, hot reloads are local, meaning that only the place modified will change, and other elements
on the page will not be refreshed.
:::

## 自定义 {lang="zh-CN"}

## Customization {lang="en"}

::: zh-CN
强大的自定义能力，你可以如忒修斯之船一样组件粒度地继承定制主题与你的博客。

更多请参见 [自定义组件](/guide/custom/components)。
:::

::: en
Valaxy provides powerful customization support. You can customize every component for your theme and blog
just like the Ship of Theseus.

See more at [Customizing Components](/guide/custom/components).
:::

## UnoCSS

::: zh-CN
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
:::

::: en
> The builtin TailwindCSS-like util class (based on [UnoCSS](https://github.com/unocss/unocss)).

If you have used [TailwindCSS](https://tailwindcss.com/) before, then you will rapidly learn it's convenience.

You can use it at will in your Markdown and Vue components, and it will finally get packaged by need and loaded.

For example:

```md
This is markdown.

<div class="bg-white text-blue shadow" p="4">
This is markdown.
</div>
```

You will get the effect immediately like this:

<div class="bg-white text-blue shadow" p="4">
This is markdown.
</div>
:::

## Icones

::: zh-CN
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
:::

::: en
> Massive amount of icons

You can use any icons that are from [Icônes](https://icones.js.org/).

The naming rule is `i-${collection}-${name}`, e.g. `i-ri-home-line`.

The theme by default has [RemixIcon](https://github.com/Remix-Design/RemixIcon) installed.

If you need any icons from other collections, you can install yourself. For example:

```bash
# `collection` is the name of the icon collection, e.g. @iconify-json/ri
npm i @iconify-json/collection
```

All icon names added to `config.unocss.safelist` will be ready for hot reloading.
:::

## UI

### 代码高亮 {lang="zh-CN"}

### Syntax Highlighting {lang="en"}

::: zh-CN
基于 [Shiki](https://github.com/shikijs/shiki) 实现。
Valaxy 支持 `vue` 等语法高亮，拷贝代码，高亮其中某一行。

譬如：
:::

::: en
Based on [Shiki](https://github.com/shikijs/shiki).
Valaxy supports syntax highlighting for languages like `vue`, and also supports copying code and
highlighting a particular line in the code block.

For example:
:::

```js {2}
const a = 1
const b = a
```

### 自定义主题色 {lang="zh-CN"}

### Custom Theme Color {lang="en"}

::: zh-CN
你只需传入一个主题色，全局各处的色彩会动态进行计算得出最终的效果。

譬如我希望主题色是红色：

> `valaxy-theme-yun` 支持
:::

::: en
You only need to provide a theme color for the global color dynamics to work and show effect.

For example, if I want my theme color to be red:

> Supported by `valaxy-theme-yun`
:::

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

::: zh-CN
但不仅如此，其他主题同样可复用 Valaxy 默认提供的色彩及变量函数来快速构建自身。

> 更多请参见 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) 代码。
:::

::: en
Even more, other themes can also re-use the default color dynamic functions provided by Valaxy
to build their own.

> Please refer to code in [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) for more.
:::

## File-based Routing {lang="en"}

## 基于文件的自动路由 {lang="zh-CN"}

::: zh-CN
路由会自动遵循相同目录结构从当前路径中的 Vue 文件生成。更多请参考 [`vite-plugin-pages`](https://github.com/hannoeru/vite-plugin-pages)。
:::

::: en
Routes will be auto-generated for Vue files in this dir with the same file structure.
Check out [`vite-plugin-pages`](https://github.com/hannoeru/vite-plugin-pages) for more details.
:::

## 构建 {lang="zh-CN"}

## Building {lang="en"}

::: zh-CN
同时支持 SPA 与 SSG 两种方案。
:::

::: en
Supports SPA and SSG.
:::

### SSG

::: zh-CN
基于 [vite-ssg](https://github.com/antfu/vite-ssg) 实现
:::

::: en
Based on [vite-ssg](https://github.com/antfu/vite-ssg)
:::

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

## SEO

::: zh-CN
Valaxy 已经默认集成了 Open Graph 的 SEO 优化，您无需为此操心。
但需要注意的是，对于许多搜索引擎来说，他们可能只青睐 SSG 的构建模式。
:::

::: en
Valaxy by default has integrated SEO optimization by Open Graph, and you don't need to worry about that.
Note that for many search engines, they like SSG builds more.
:::

## RSS

::: zh-CN
自带命令生成 RSS 订阅源。

> [RSS 是什么？](https://baike.baidu.com/item/rss/24470)
:::

::: en
Valaxy comes with a command to generate RSS feeds.

> [What is RSS?](https://en.wikipedia.org/wiki/RSS)
:::

```bash
npm run rss
# valaxy rss
```

## i18n in One Page {lang="en"}

## 单页 i18n {lang="zh-CN"}

::: zh-CN
详情请见 [i18n](/posts/i18n)。
:::

::: en
For more info, see [i18n](/posts/i18n).
:::

## KaTeX

::: zh-CN
KaTeX 已被默认支持并启用。
:::

::: en
Katex is enabled by default.
:::

```ts
// valaxy.config.ts
import { defineValaxyConfig } from 'valaxy'
export default defineValaxyConfig({
  features: {
    // disable katex
    katex: false
  }
})
```

::: zh-CN

- [KaTeX | 示例](/examples/katex)

:::

::: en

- [KaTeX | Examples](/examples/katex)

:::

## 自动路由替换 {lang="zh-CN"}

## Auto Route Replacing {lang="en"}

::: zh-CN
当 Valaxy 检测到文章的 a 链接为站内链接时，会自动将其替换为 `RouterLink`，享受丝滑的动态切换吧！
:::

::: en
When Valaxy detects that an `a` hyperlink in a post is an intra-site link (relative link),
it will automatically replace it with a `RouterLink`. Enjoy the dynamic page switching!
:::
