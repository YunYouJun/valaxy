---
title: 开始
categories:
  - getting-started
top: 100
---


## 总览 {#overview}


<span text-purple-600 font="bold">Valaxy</span> <span bg="$va-c-bg-soft" font="bold" px-2 py-1 rounded text-sm>= V + <span op="30">G</span>alaxy</span> 旨在成为下一代静态博客框架，提供更好的热更新与用户加载体验、更强大更便捷的自定义开发可能性。

你可以在 [为什么选 Valaxy](/zh/guide/why) 中了解更多关于项目的设计初衷。

::: tip
`Valaxy` 基于 [Vite](https://vitejs.dev/) 提供热更新与打包等功能，基于 [Vue](https://vuejs.org/) 实现视图（如主题、自定义组件）等客户端功能。

因此 Valaxy 兼容并可自由使用 Vite 与 Vue 生态的所有插件。
:::




## 创建 Valaxy 项目 {#create-a-valaxy-project}


> 示例: [yun.valaxy.site](https://yun.valaxy.site)


### 在线试用 {#try-it-online}


你可以通过 [StackBlitz](https://stackblitz.com/edit/valaxy) 在线试用 Valaxy（默认使用主题 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/)）。

[![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/edit/valaxy)

> 这是一个极简项目，您仅需以下几个文件，就可以快速搭建好你的博客！
>
> - `pages` 文件夹：存放页面/文章
> - `valaxy.config.ts` Valaxy 配置文件
> - `package.json` 记录依赖




### 在本地创建 {#locally}


::: danger 兼容

由于 Vite@7 要求 [Node.js](https://nodejs.org/en/) 的版本为 `^20.19.0 || >=22.12.0`，Valaxy 同样需要你将 Node.js 升级至 `20.19.0` 版本之后。

:::

::: tip

如果您是 Windows 用户，我们**强烈建议**您使用类 Unix 的 Shell（如 [Git Bash](https://git-scm.com/downloads) 或 [WSL](https://docs.microsoft.com/en-us/windows/wsl/install)），而非 CMD / PowerShell.

:::

如果您想要在本地创建，只需要执行以下命令：



> 由于 `npm init` 会缓存您此前下载的版本，我更推荐您使用 `pnpm` 来创建模版。
> [安装 pnpm](https://pnpm.io/installation)


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

跟随命令行提示完成创建！

> 默认使用主题 [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/)，当然您也可以安装使用任意其他主题。
> 本文档同样是一个 Valaxy 主题 [valaxy-theme-press](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/)，它的灵感来自 [VitePress](https://vitepress.dev/)。



## 使用 {#usage}

> 进入你创建好后的文件夹目录后，执行以下命令。
> 譬如：`cd valaxy-blog`。

安装依赖：


::: code-group

```bash [pnpm]
# install
pnpm i
```

```bash [npm]
# install
npm i
```

::::

启动预览：


::: code-group

```bash [pnpm]
# start
pnpm dev
```

```bash [npm]
# start
npm run dev
```

::::

博客创建完毕，查看本地 `http://localhost:4859/`，玩的开心！

- Valaxy 博客通用的配置可参见 [配置](/zh/guide/config/) 与 [自定义扩展](/zh/guide/custom/extend)。
- Valaxy 主题独有配置请参见对应主题文档。（Valaxy Theme Yun 主题文档编写中……）



### 配置 {#config}


修改 `valaxy.config.ts` 来自定义你的博客吧。

基础配置可参见 [配置](/zh/guide/config/)。

文档正在不断完善中！


## 部署 {#deployment}

部署可参见 [部署｜指南](/zh/guide/deploy)。



## 升级 {#upgrading}

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

### pnpm {#pnpm}

> 你可以使用 pnpm 的交互升级命令。


```bash
# interactive upgrade
pnpm up --latest -i
```


## 迁移 {#migration}


如果你来自其他博客框架，可参考 [迁移](/zh/migration/)。


## 目录结构 {#directory-structure}


在大部分情况下，你只需要在 `pages` 文件夹下进行工作，编写文章。


### 主要的文件夹 {#main-folders}



- `pages`: 你的所有页面
  - `posts`: 写在 `pages/posts` 文件夹下的内容，将被当作博客文章
- `styles`: 覆盖主题样式，文件夹下的这些 scss 文件将会被自动加载
  - `index.ts` / `index.scss` / `index.css`
- `components`: 自定义你的组件（将会被自动注册）
- `layouts`: 自定义布局 (譬如可以通过 `layout: xxx` 来使用 `layouts/xxx.vue` 布局)
- `locales`: 自定义国际化关键词


### 其他 {#others}



- `.vscode`: 推荐安装一些有用的 VSCode 插件，这样你可以直接预览一些图标、国际化、辅助的 CSS Class 等
  - 你可以在 VSCode 插件商店中找到 [`Valaxy` 插件](https://marketplace.visualstudio.com/items?itemName=yunyoujun.valaxy)，它提供了文章列表预览/切换/删除等功能，让你尽可能地可以在 VSCode 中完成所有操作。
- `.github`: 使用 GitHub Actions 自动构建并部署到 GitHub Pages
- `netlify.toml`: [Netlify](https://www.netlify.com/) 自动配置
- `vercel.json`: [Vercel](https://vercel.com/) 重定向配置



## 主题 {#themes}


如果您希望自己开发一个主题并发布，您可以参考 [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter)。

更多内容请参见 [如何编写一个 Valaxy 主题](/zh/themes/write)。


## 社区 {#community}


如果你有疑问或者需要帮助，可以到 [Discord](https://discord.gg/nd3mPkU5j8) 和 [GitHub Discussions](https://github.com/YunYouJun/valaxy/discussions) 社区来寻求帮助。

