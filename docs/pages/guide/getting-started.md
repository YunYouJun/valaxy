---
title: Getting Started
categories:
  - getting-started
top: 100
---

## Overview


<span text-purple-600 font="bold">Valaxy</span> <span bg="$va-c-bg-soft" font="bold" px-2 py-1 rounded text-sm>= V + <span op="30">G</span>alaxy</span> aims for the next generation static blog framework, providing better hot reloading and user loading experience, with easier and powerful customization support.

You can learn more about the original intensions for this project in [Why Valaxy](/guide/why).

::: tip
`Valaxy` is based on [Vite](https://vitejs.dev/) to provide hot reloading and packaging, and based on [Vue](https://vuejs.org/) to realize client functionalities such as views (themes, custom components).

Therefore, Valaxy supports all extensions/plugins for Vite and Vue.
:::


## Create a Valaxy Project


> Example: [yun.valaxy.site](https://yun.valaxy.site)


### Try it Online


You can use [StackBlitz](https://stackblitz.com/edit/valaxy) to try Valaxy online (the default theme used is [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/)).

[![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/valaxy)

> This is an extremely simple project. You only need the following files to rapidly build your own blog!
>
> - `pages` folder: storing the pages/posts
> - `valaxy.config.ts`: Valaxy's configuration file
> - `package.json`: dependencies

### Locally


::: danger Compatibility Note

Vite@7 requires [Node.js](https://nodejs.org/en/) version `^20.19.0 || >=22.12.0`. Valaxy also requires you to upgrade Node.js after version `20.19.0`.

:::

::: tip

If you are a Windows user, I strongly recommend using a Unix-like shell (such as [Git Bash](https://git-scm.com/downloads) or [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) rather than CMD / PowerShell.

:::


> Since `npm init` caches your previously downloaded version, I would recommend using `pnpm` to create templates.
> Install [pnpm](https://pnpm.io/)：`npm i -g pnpm`

::: code-group

```bash [pnpm]
pnpm create valaxy
```

```bash [npm]
npm init valaxy
```

:::

::: details You will be greeted with a few simple questions.
<CreateValaxyTooltip />
:::


Follow the prompt in the commandline to complete the process!

> The default theme used is [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/), but you can also install any other themes.
> This documentation is also a Valaxy theme: [valaxy-theme-press](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/). It is inspired by [VitePress](https://vitepress.dev/).

## Usage


> Enter the folder for the Valaxy project you just created, and execute the following commands.
> For example: `cd valaxy-blog`.

Install the dependencies:

::: code-group

```bash [pnpm]
# install
pnpm i
```

```bash [npm]
# install
npm i
```

:::


Start a preview:

::: code-group

```bash [pnpm]
# start
pnpm dev
```

```bash [npm]
# start
npm run dev
```

:::


See `http://localhost:4859/`, have fun!

- See [Config](/guide/config/) and [Custom Extensions](/guide/custom/extend) for the general configuration for Valaxy blogs.
- For configuring Valaxy themes, please see the documentation for the corresponding themes. (Docs for Valaxy Theme Yun is still work in progress)

### Config


Modify `valaxy.config.ts` to custom your blog.

See [Config](/guide/config/) for basic configuration.

Documentation is being improved!


## Deployment


See [Deployment](/guide/deploy) for deployment guide.

## Upgrading


::: code-group

```bash [pnpm]
cd your-blog
# upgrade valaxy
pnpm add valaxy@latest
# upgrade theme
pnpm add valaxy-theme-yun@latest
```

```bash [npm]
cd your-blog
# upgrade valaxy
npm i valaxy@latest
# upgrade theme
npm i valaxy-theme-yun@latest
```

:::

### pnpm


> You can use the interactive upgrade command provided by `pnpm`.

```bash
# interactive upgrade
pnpm up --latest -i
```

## Migration


If you are from another blog framework, you can refer to [Migration](/migration/).


## Directory Structure


In most cases, you only need to work in the `pages` folder.


### Main folders


- `pages`: your all pages
  - `posts`: write your posts here, will be counted as posts
- `styles`: override theme styles, `index.scss`/`vars.csss`/`index.css` will be loaded automatically
- `components`: custom your vue components (will be loaded automatically)
- `layouts`: custom layouts (use it by `layout: xxx` in md)
- `locales`: custom i18n


### Others


- `.vscode`: recommend some useful plugins & settings, you can preview icon/i18n/class...
- `.github`: GitHub Actions to auto build & deploy to GitHub Pages
- `netlify.toml`: for [netlify](https://www.netlify.com/)
- `vercel.json`: for [vercel](https://vercel.com/)


## Themes


If you want to develop a theme and released, you can refer to [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter).


## Community


If you have questions or need help, you can go to the [Discord](https://discord.gg/nd3mPkU5j8) and [Discussions](https://github.com/YunYouJun/valaxy/discussions) to ask for help.

