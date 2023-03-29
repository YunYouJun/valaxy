<h1 align="center">
<a href="https://valaxy.site">Valaxy</a>
</h1>

<p align="center">
🌌 Next Generation Static Blog Framework (Beta).
</p>

<pre align="center">
🧪 Working in Progress
</pre>

<p align="center">
<a href="https://www.npmjs.com/package/valaxy" rel="nofollow"><img src="https://img.shields.io/npm/v/valaxy?color=0078E7" alt="NPM version"></a>
<a href="https://github.com/YunYouJun/valaxy/actions/workflows/release.yml"><img src="https://github.com/YunYouJun/valaxy/actions/workflows/release.yml/badge.svg" alt="Release"></a>
<a href="https://discord.gg/nd3mPkU5j8" target="_blank">
<img alt="Discord" src="https://img.shields.io/discord/752821465891733574?color=%234960ea&logo=discord">
</a>
</p>

- **English** | [简体中文](./README.zh-CN.md)
- [English Docs](https://valaxy.site/?lang=en) | [中文文档](https://valaxy.site/?lang=zh-CN) | [Docs for Beta](https://beta.valaxy.site)
- [Demo](https://yun.valaxy.site): <small>with [valaxy-theme-yun](./packages/valaxy-theme-yun/)</small>

## Usage

### Try it Online

[![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/valaxy)

### Init Project Locally

Just run the following command to init your blog:

```bash
# pnpm (recommended)
pnpm create valaxy
# npm
# npm init valaxy
# yarn
# yarn create valaxy
```

For a example, you can see [demo/yun](./demo/yun/) folder.

## Features

- ⚡️ [Vue 3](https://github.com/vuejs/vue-next), [Vite 4](https://github.com/vitejs/vite), [pnpm](https://pnpm.js.org/), [ESBuild](https://github.com/evanw/esbuild) - born with fastness
- 🔥 Hot Reload with Config & Markdown
- 🔧 Type Tooltip for all config by `valaxy.config.ts`
- 🗒 Extended Markdown Frontmatter
- 🗂 File based routing via [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
- 📦 Components auto importing via [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)
- 🖨 Static-site generation (SSG) via [vite-ssg](https://github.com/antfu/vite-ssg) (SPA is OK!)
- 🕸 RSS & Sitemap
- 🎨 Free to use Tailwind CSS via [UnoCSS](https://github.com/antfu/unocss)
- 🌍 [CSS i18n in One Page](https://valaxy.site/guide/i18n)
- 🔍 [Use icons from any icon sets with classes](https://github.com/antfu/unocss/tree/main/packages/preset-icons) - [Icônes](https://icones.netlify.app/)
- 👔 Extended Theme with [Layout system](https://github.com/JohnCampionJr/vite-plugin-vue-layouts)
- ⚙️ Unit Testing with [Vitest](https://github.com/vitest-dev/vitest) (Todo)
- ☁️ Deploy zero-config
  - [Netlify](https://www.netlify.com/) with `netlify.toml`
  - [GitHub Pages](https://pages.github.com/) with `.github/workflows/gh-pages.yml` [GitHub Actions](https://github.com/features/actions)
- ♻️ Use any vite plugins
  - 📲 You can implement PWA by [vite-plugin-pwa](https://github.com/antfu/vite-plugin-pwa>)
- ...

## Dev

Want to get involved in the development? Look [here](https://valaxy.site/dev).

Want to create your theme? Check [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter).

## Thanks

💗 The implementation of Valaxy is based on or refer the following projects:

- [Vue](https://github.com/vuejs/core)
- [VueUse](https://github.com/vueuse/vueuse)
- [Vite](https://github.com/vitejs/vite)
- [VitePress](https://github.com/vuejs/vitepress)
- [Vitesse](https://github.com/antfu/vitesse)
- [Slidev](https://github.com/slidevjs/slidev)

## [Sponsors](https://sponsors.yunyoujun.cn)

❤️ Special thanks to the following sponsors for their support.

<p align="center">
  <a href="https://sponsors.yunyoujun.cn">
    <img src='https://fastly.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg'/>
  </a>
</p>
