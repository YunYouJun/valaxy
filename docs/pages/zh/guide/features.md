---
title: 亮点
categories:
  - getting-started
end: false
top: 98
---

首先，我们来介绍一下 Valaxy 有哪些便捷的特性。


## 热更新 {#hot-reloading}


最值得一提的是，Valaxy 从配置到文章内容、动画到全局的标签、分类，全部都是支持热更新的！局部的！

譬如，你修改了 `valaxy.config.ts`/`site.config.ts` 或是 `xxx.md` 文章中的内容或 `frontmatter`（`tags`/`categories`）所有的变动会立刻显示在预览界面上，无需手动刷新。同时热更新也是局部的，它只变动有修改的地方，不会重新刷新整个页面。


## 自定义 {#customization}


强大的自定义能力，你可以如忒修斯之船一样组件粒度地继承定制主题与你的博客。

更多请参见 [自定义组件](/zh/guide/custom/components)。


## UnoCSS {#unocss}

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


## Icones {#icones}

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


## UI {#ui}

### 代码高亮 {#syntax-highlighting}



> 更多关于代码高亮的信息请参见 [Markdown 代码高亮](/zh/guide/markdown#%25E4%25BB%25A3%25E7%25A0%2581%25E8%25A1%258C%25E9%25AB%2598%25E4%25BA%25AE)。

基于 [Shiki](https://shiki.style) 实现。
Valaxy 支持 `vue` 等语法高亮，拷贝代码，高亮其中某一行。

譬如：


```js {2}
const a = 1
const b = a
```

### 自定义主题色 {#custom-theme-color}


你只需传入一个主题色，全局各处的色彩会动态进行计算得出最终的效果。

譬如我希望主题色是红色：

> `valaxy-theme-yun` 支持


```ts [valaxy.config.ts]
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



## 基于文件的自动路由 {#file-based-routing}

路由会自动遵循相同目录结构从当前路径中的 Vue/Markdown 文件生成。更多请参考 [unplugin-vue-router](https://github.com/posva/unplugin-vue-router)。


## 构建 {#building}


同时支持 SPA 与 SSG 两种方案。


### SSG {#ssg}

基于 [vite-ssg](https://github.com/antfu/vite-ssg) 实现


```bash
# SSG
npm run build:ssg
# valaxy build --ssg
```

### SPA {#spa}

```bash
npm run build:spa
# valaxy build
```

## SEO {#seo}

Valaxy 已经默认集成了 Open Graph 的 SEO 优化，您无需为此操心。
但需要注意的是，对于许多搜索引擎来说，他们可能只青睐 SSG 的构建模式。


## RSS {#rss}

自带命令生成 RSS 订阅源。

> [RSS 是什么？](https://baike.baidu.com/item/rss/24470)

更多配置选项请参见 [RSS 配置](/zh/guide/config/extend#rss)。


```bash
npm run rss
# valaxy rss
```


## 单页 i18n {#i18n-in-one-page}

详情请见 [i18n](/zh/posts/i18n)。


## Math | 数学公式 {#math-数学公式}

Valaxy 支持两种数学渲染引擎：KaTeX（默认，渲染快）和 MathJax（SVG 输出，无需外部 CSS/字体）。


```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  // KaTeX (enabled by default)
  features: {
    katex: true
  },

  // Or switch to MathJax (install first: pnpm add markdown-it-mathjax3)
  // math: true,
})
```


- [数学公式 | 示例](/zh/examples/math)
- [通过 CDN 加载 KaTeX](/zh/guide/config/extend#cdn-externals) (实验性)



## 自动路由替换 {#auto-route-replacing}


当 Valaxy 检测到文章的 a 链接为站内链接时，会自动将其替换为 `RouterLink`，享受丝滑的动态切换吧！


