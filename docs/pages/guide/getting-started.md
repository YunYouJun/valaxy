---
title: Getting Started
title_zh-CN: 开始
categories:
  - Getting Started
end: true
top: 100
---

## Overview {lang="en"}

## 总览 {lang="zh-CN"}

Valaxy （V + Galaxy）旨在成为下一代静态博客框架，提供更好的热更新与用户加载体验、更强大更便捷的自定义开发可能性。

你可以在 [为什么选 Valaxy](/guide/why) 中了解更多关于项目的设计初衷。

::: tip
Valaxy 基于 [Vite](https://vitejs.dev/) 提供热更新与打包等功能，基于 [Vue](https://vuejs.org/) 实现视图（如主题、自定义组件）等客户端功能。

因此 Valaxy 兼容并可自由使用 Vite 与 Vue 生态的所有插件。
:::

## Create a Valaxy Project {lang="en"}

## 创建 Valaxy 项目 {lang="zh-CN"}

> Example: [yun.valaxy.site](https://yun.valaxy.site)

### Try it Online {lang="en"}

### 在线试用 {lang="zh-CN"}

你可以通过 [StackBlitz](https://stackblitz.com/edit/valaxy) 在线试用 Valaxy（默认使用主题 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/)）。

[![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/valaxy)

> 这是一个极简项目，您仅需一下几个文件，就可以快速搭建好你的博客！
>
> - `pages` 文件夹：存放页面/文章
> - `valaxy.config.ts` Valaxy 配置文件
> - `package.json` 记录依赖

### Locally {lang="en"}

### 在本地创建 {lang="zh-CN"}

<div lang="zh-CN">

::: danger 兼容

由于 Vite 要求 [Node.js](https://nodejs.org/en/) 的版本为 14.18+, 16+，Valaxy 同样需要你将 Node.js 升级至 14.18 版本之后。

:::

::: tip

如果您是 Windows 用户，我强烈建议您使用类 Unix 的 Shell（如 [Git Bash](https://git-scm.com/downloads) 或 [WSL](https://docs.microsoft.com/en-us/windows/wsl/install)），而非 CMD / PowerShell.

:::

如果您想要在本地创建，只需要执行以下命令：

</div>

<div lang="en">

::: danger Compatibility Note

Vite requires [Node.js](https://nodejs.org/en/) version 14.18+, 16+. Valaxy also requires you to upgrade Node.js after version 14.18+.

:::

::: tip

If you are a Windows user, I strongly recommend using a Unix-like shell (such as [Git Bash](https://git-scm.com/downloads) or [WSL](https://docs.microsoft.com/en-us/windows/wsl/install) rather than CMD / PowerShell.

:::

</div>

```bash
npm init valaxy
```

::: zh-CN
> 由于 `npm init` 缓存您此前下载的版本，我更推荐您使用 `pnpm` 来创建模版。  
> 安装 [pnpm](https://pnpm.io/)：`npm i -g pnpm`
:::

::: en
> Since `npm init` caches your previously downloaded version, I would recommend using `pnpm` to create templates.  
> Install [pnpm](https://pnpm.io/)：`npm i -g pnpm`
:::

```bash
pnpm create valaxy
```

跟随命令行提示完成创建！

> 默认使用主题 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/)，当然您也可以安装使用任意其他主题。  
> 本文档同样是一个 Valaxy 主题 [valaxy-theme-press](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/)。

## Usage {lang="en"}

## 使用 {lang="zh-CN"}

> 进入你创建好后的文件夹目录后，执行以下命令。
> 譬如：`cd valaxy-blog`。

安装依赖：

```bash
# install
npm i
# or pnpm i
```

启动预览：

```bash
# start
npm run dev
# or pnpm dev
```

::: zh-CN
博客创建完毕，查看本地 `http://localhost:4859/`，玩的开心！
:::

::: en
See `http://localhost:4859/`, have fun!
:::

- Valaxy 博客通用的配置可参见 [配置](/guide/config) 与 [自定义扩展](/guide/custom/extend)。
- Valaxy 主题独有配置请参见对应主题文档。（Valaxy Theme Yun 主题文档编写中……）

### Config {lang="en"}

### 配置 {lang="zh-CN"}

::: en
Modify `valaxy.config.ts` to custom your blog.

Documentation is being improved!
:::

::: zh-CN
修改 `valaxy.config.ts` 来自定义你的博客吧。

文档正在不断完善中！
:::

## Deploy {lang="en"}

## 部署 {lang="zh-CN"}

部署可参见 <RouterLink to="/guide/deploy">部署｜指南</RouterLink>。

## Upgrade {lang="en"}

## 升级 {lang="zh-CN"}

```bash
cd your-blog
# upgrade valaxy
npm i valaxy@latest
# upgrade theme
npm i valaxy-theme-yun@latest
```

### pnpm

> 你可以使用 pnpm 的交互升级命令。

```bash
# interactive upgrade
pnpm up --latest -i
```

## Structure {lang="en"}

## 目录结构 {lang="zh-CN"}

::: en
In most cases, you only need to work in the `pages` folder.
:::

::: zh-CN
在大部分情况下，你只需要在 `pages` 文件夹下进行工作，编写文章。
:::

### Main folders {lang="en"}

### 主要的文件夹 {lang="zh-CN"}

::: en

- `pages`: your all pages
  - `posts`: write your posts here, will be counted as posts
- `styles`: override theme styles, `index.scss`/`vars.csss`/`index.css` will be loaded automatically
- `components`: custom your vue components (will be loaded automatically)
- `layouts`: custom layouts (use it by `layout: xxx` in md)
- `locales`: custom i18n

:::

::: zh-CN

- `pages`: 你的所有页面
  - `posts`: 写在 `pages/posts` 文件夹下的内容，将被当作博客文章
- `styles`: 覆盖主题样式，文件夹下的这些 scss 文件将会被自动加载
  - `index.scss` / `index.css`
  - `css-vars.scss` / `css-vars.css`
- `components`: 自定义你的组件（将会被自动注册）
- `layouts`: 自定义布局 (譬如可以通过 `layout: xxx` 来使用 `layouts/xxx.vue` 布局)
- `locales`: 自定义国际化关键词
:::

### Other {lang="en"}

### 其他 {lang="zh-CN"}

::: en

- `.vscode`: recommend some useful plugins & settings, you can preview icon/i18n/class...
- `.github`: GitHub Actions to auto build & deploy to GitHub Pages
- `netlify.toml`: for [netlify](https://www.netlify.com/)
- `vercel.json`: for [vercel](https://vercel.com/)

:::

::: zh-CN

- `.vscode`: 推荐安装一些有用的 VSCode 插件，这样你可以直接预览一些图标、国际化、辅助的 CSS Class 等
- `.github`: 使用 GitHub Actions 自动构建并部署到 GitHub Pages
- `netlify.toml`: [Netlify](https://www.netlify.com/) 自动配置
- `vercel.json`: [Vercel](https://vercel.com/) 重定向配置

:::

## Theme {lang="en"}

## 主题 {lang="zh-CN"}

::: en
If you want to develop a theme and released, you can refer to [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter).
:::

::: zh-CN
如果您希望自己开发一个主题并发布，您可以参考 [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter)。

更多内容请参见 [如何编写一个 Valaxy 主题](/themes/write).
:::

## Community {lang="en"}

## 社区 {lang="zh-CN"}

::: en
If you have questions or need help, you can go to the [Discord](https://discord.gg/nd3mPkU5j8) and [Discussions](https://github.com/YunYouJun/valaxy/discussions) to ask for help.
:::

::: zh-CN
如果你有疑问或者需要帮助，可以到 [Discord](https://discord.gg/nd3mPkU5j8) 和 [GitHub Discussions](https://github.com/YunYouJun/valaxy/discussions) 社区来寻求帮助。
:::
