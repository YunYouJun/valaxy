---
title: Features
categories:
  - getting-started
end: false
top: 98
---


First, I'll introduce you to some easy


## Hot Reloading


It's most worth mentioning that Valaxy supports partial hot reloading, for configuration, post contents,
animation, tags, categories, and much more!

For example, if you modified `valaxy.config.ts`/`site.config.ts`, the content in `xxx.md`, or `frontmatter`
(`tags`/`categories`), all changes will immediately appear on the preview page, and there is no need for manual
refreshing. Also, hot reloads are local, meaning that only the place modified will change, and other elements
on the page will not be refreshed.


## Customization


Valaxy provides powerful customization support. You can customize every component for your theme and blog
just like the Ship of Theseus.

See more at [Customizing Components](/guide/custom/components).

## UnoCSS


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

## Icones


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

## UI


### Syntax Highlighting

> More info about syntax highlighting can be found at [Markdown Syntax Highlighting](/guide/markdown#syntax-highlighting).


Based on [Shiki](https://shiki.style).
Valaxy supports syntax highlighting for languages like `vue`, and also supports copying code and
highlighting a particular line in the code block.

For example:

```js {2}
const a = 1
const b = a
```


### Custom Theme Color


You only need to provide a theme color for the global color dynamics to work and show effect.

For example, if I want my theme color to be red:

> Supported by `valaxy-theme-yun`

```ts [valaxy.config.ts]
export default {
  themeConfig: {
    colors: {
      primary: 'red',
    },
  },
}
```


Even more, other themes can also re-use the default color dynamic functions provided by Valaxy
to build their own.

> Please refer to code in [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun) for more.

## File-based Routing


Routes will be auto-generated for Vue/Markdown files in this dir with the same file structure.
Check out [`unplugin-vue-router`](https://github.com/posva/unplugin-vue-router) for more details.


## Building


Supports SPA and SSG.

### SSG


Based on [vite-ssg](https://github.com/antfu/vite-ssg)

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


Valaxy by default has integrated SEO optimization by Open Graph, and you don't need to worry about that.
Note that for many search engines, they like SSG builds more.

## RSS


Valaxy comes with a command to generate RSS feeds.

> [What is RSS?](https://en.wikipedia.org/wiki/RSS)

For more configuration options, see [RSS Configuration](/guide/config/extend#rss).

```bash
npm run rss
# valaxy rss
```

## i18n in One Page


For more info, see [i18n](/posts/i18n).

## Math | 数学公式


Valaxy supports two math rendering engines: KaTeX (default, fast rendering) and MathJax (SVG output, no external CSS/fonts needed).

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


- [Math Formulas | Examples](/examples/math)
- [Load KaTeX from CDN](/guide/config/extend#cdn-externals) (Experimental)


## Auto Route Replacing


When Valaxy detects that an `a` hyperlink in a post is an intra-site link (relative link),
it will automatically replace it with a `RouterLink`. Enjoy the dynamic page switching!
