---
title: Getting Started
title_zh: 开始
categories:
  - Docs
  - Guide
layout: docs
end: false
---

> Example: [valaxy.yyj.moe](https://valaxy.yyj.moe)

::: danger

如果您是 Windows 用户，我强烈建议您使用类 Unix 的 Shell（如 [Git Bash](https://git-scm.com/downloads) 或 [WSL](https://docs.microsoft.com/en-us/windows/wsl/install)），而非 CMD / PowerShell.

:::

## Create

```bash
npm init valaxy
```

::: zh-CN
由于 `npm init` 缓存您此前下载的版本，我更推荐您使用 `pnpm` 来创建模版。
:::

```bash
pnpm create valaxy
```

## Upgrade

```bash
cd your-blog
# upgrade valaxy
npm i valaxy@latest
# upgrade theme
npm i valaxy-theme-yun@latest
```

### pnpm

```bash
# interactive upgrade
pnpm up --latest -i
```

## Usage

```bash
# install
npm i
# or pnpm i

# start
npm run dev
# or pnpm dev
```

See `http://localhost:4859/`, have fun!

### Config

Modify `valaxy.config.ts` to custom your blog.

English & Chinese Docs is coming!

> Wait a minute.

## Structure

In most cases, you only need to work in the `pages` folder.

### Main folders

- `pages`: your all pages
  - `posts`: write your posts here, will be counted as posts
- `styles`: override theme styles, `index.scss`/`vars.csss`/`index.css` will be loaded automatically
- `components`: custom your vue components (will be loaded automatically)
- `layouts`: custom layouts (use it by `layout: xxx` in md)
- `locales`: custom i18n

### Other

- `.vscode`: recommend some useful plugins & settings, you can preview icon/i18n/class...
- `.github`: GitHub Actions to auto build & deploy to GitHub Pages
- `netlify.toml`: for [netlify](https://www.netlify.com/)
- `vercel.json`: for [vercel](https://vercel.com/)



