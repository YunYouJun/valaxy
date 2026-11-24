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
Check out [`vue-router` file-based routing](https://router.vuejs.org/file-based-routing/) for more details.


## Building


Supports SPA and SSG.

### SSG


Uses the built-in Valaxy SSG engine (Vue SSR + pure string rendering, no JSDOM).

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

Static builds include the tags answer engines and search results use. You do not need a per-post SEO plugin for the defaults below.

- The document title is `Page title - Site title`. The homepage, which has no page title, uses the site title alone. A page can set `titleTemplate`.
- The meta description uses frontmatter `description`, then a plain-text excerpt of the public body, then `siteConfig.description`.
- `link rel="canonical"` follows the route's trailing slash. `pages/posts/hello.md` is `/posts/hello`; `pages/about/index.md` is `/about/`.
- Open Graph and Twitter tags are written for every page. The share image is `ogImage`, then legacy `image`, then `cover`, then the first content image. Set `siteConfig.seo.ogImage` for pages that have none of those. The favicon is not used.
- JSON-LD includes a `WebSite`, a `Person` (`#identity`, with `sameAs` from `siteConfig.social`), and a `BreadcrumbList`. Posts also get `BlogPosting` or `Article` with `datePublished`, `dateModified`, the same author id, and the share image.
- `sitemap.xml` lists each canonical URL once and adds `lastmod` from the page's `updated` or `date`. `robots.txt` is generated when you do not provide `public/robots.txt`.
- `/404` and generated `/page/2` routes are `noindex`. `/page/1` canonicalizes to the homepage. Set `siteConfig.seo.pagination: 'index'` to keep paginated indexes indexable.
- When RSS is enabled (the default) and `siteConfig.url` is configured, pages link `feed.xml` and `atom.xml` with `rel="alternate"`.
- A Markdown image with an empty alt keeps `alt=""` by default so decorative images stay ignored by screen readers. Set `features.imageAltFallback: true` to fill empty alts from readable filenames (hashes and generic screenshot names stay empty).
- Social links that point at an image, such as a QR code, are left out of `sameAs`. Use `sameAs: false` for groups and link directories that are not the author.

`llms.txt` stays off until `siteConfig.llms.enable` is true. New projects turn it on in the scaffold. See [Work with AI](/guide/work-with-ai).

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
