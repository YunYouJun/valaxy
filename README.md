<p align="center">
<h1><a href="https://valaxy.netlify.app">Valaxy</a></h1>
</a>

<p align="center">
🌌 Next Generation Static Blog Framework (Beta).
</p>

<pre align="center">
🧪 Working in Progress
</pre>

[![NPM version](https://img.shields.io/npm/v/valaxy?color=0078E7)](https://www.npmjs.com/package/valaxy)
[![Release](https://github.com/YunYouJun/valaxy/actions/workflows/release.yml/badge.svg)](https://github.com/YunYouJun/valaxy/actions/workflows/release.yml)

English (Todo) | [简体中文](./README.zh-CN.md)

Demo: [valaxy.yyj.moe](https://valaxy.yyj.moe) (Default theme is valaxy-theme-yun)

## Usage

For a example, you can see [demo/yun](./demo/yun/) folder.

```bash
npm init valaxy
# yarn
# yarn create valaxy
# pnpm
# pnpm create valaxy
```

English & Chinese Docs are coming!

> Wait a moment...

## Dev

You must use [pnpm](https://pnpm.io/). Because we use its workspace.

```bash
git clone https://github.com/YunYouJun/valaxy
cd valaxy

pnpm i
# esbuild watch valaxy cli & valaxy-theme-yun
# and run demo
pnpm dev
```

If you want to display info better in two terminal:

You could do:

```bash
# watch valaxy & valaxy-theme-yun
pnpm dev:lib
# open a new terminal to run demo
pnpm demo
```

### Client

If you only want to develop client.

## Features

- ⚡️ [vitesse](https://github.com/antfu/vitesse): Best Practices of Vue3
- ☁️ Deploy on [Netlify](https://www.netlify.com/), zero-config
- Todo

### Icons

- [Iconify](https://iconify.design) - use icons from any icon sets [🔍Icônes](https://icones.netlify.app/)
- [Pure CSS Icons via UnoCSS](https://github.com/antfu/unocss/tree/main/packages/preset-icons)

## Todo

- [ ] create-valaxy-theme: Script to generate theme template.
- [ ] Github actions auto generate site from theme repo/npm.
- [ ] Debug component.
- [ ] Git timestamp for post without `date`.
- [ ] Check port is existed & use new port.

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
  <a href="https://cdn.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/YunYouJun/sponsors/public/sponsors.svg'/>
  </a>
</p>
