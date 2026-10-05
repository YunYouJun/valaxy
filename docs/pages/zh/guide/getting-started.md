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
> - `site.config.ts` 站点信息
> - `valaxy.config.ts` 主题和框架配置
> - `package.json` 记录依赖




### 在本地创建 {#locally}

::: danger 版本兼容

Valaxy 要求 [Node.js](https://nodejs.org/) **`>=22.12.0`**。本指南使用 [pnpm](https://pnpm.io/installation) **`>=10.26.0`**，以支持模板中的 `allowBuilds` 依赖构建权限配置。版本不满足要求时，请先升级再创建项目。

:::

先检查本地版本：

```bash
node --version
pnpm --version
```

在准备存放博客的目录中执行：

```bash
pnpm create valaxy@latest
```

依次选择：

1. `Select a type:` → **Blog**。
2. `Select a theme:` → **Yun**（本文使用的默认博客主题）。
3. `Project name:` → **valaxy-blog**，或一个尚不存在的目录名。
4. `Install and start it now?` → **No**，然后按下文手动安装和启动。如果选择 Yes，请选择 pnpm，并在自动启动后直接进入“写第一篇文章”。

::: details 命令行提示示例
<CreateValaxyTooltip />
:::

#### 选择主题 {#select-theme}

- **Yun**：默认博客主题，本文后续步骤以它为例。
- **Press**：面向文档的主题。
- **Custom**：输入自定义主题名，例如 `starter` 或 `valaxy-theme-starter`。

脚手架会配置主题依赖和 `valaxy.config.ts`；Press 还会使用自己的首页和配置模板。其他主题的配置请参考对应主题文档。

## 使用 {#usage}

进入刚创建的项目，安装依赖并启动开发服务器：

```bash
cd valaxy-blog
pnpm install
pnpm dev
```

保留生成的 `pnpm-workspace.yaml`：它包含模板所需的依赖安装配置，包括构建脚本权限。[pnpm 11 及以上版本默认会因未审核的依赖脚本而中止安装](https://pnpm.io/blog/releases/11.0)；模板已配置当前依赖，首次安装无需额外执行 `approve-builds`。

::: details 启动成功后的终端输出示例 {open}
以下按默认 Yun 模板的实际输出整理，省略了耗时和网卡地址。版本号、项目路径和端口以你的终端为准。

<StartValaxyTooltip />
:::

打开终端中 `Preview` 后的地址，默认是 `http://localhost:4859/`。端口被占用时会自动选择其他可用端口，因此以终端输出为准。首页应能看到示例文章 **Hello, Valaxy!**，点击标题可进入文章页。

`pnpm dev` 会持续运行。保持这个终端打开，在编辑器中修改项目；需要运行其他命令时，另开终端并进入同一个项目目录。按 `Ctrl+C` 可停止服务器。

### 写第一篇文章 {#first-post}

新建 `pages/posts/first-post.md`，写入：

```md
---
title: 我的第一篇文章
date: 2026-10-05
tags:
  - 日常
---

## 你好，Valaxy

这是我的第一篇文章。
```

将日期改为你的发布日期。文件顶部的 `---` 区域是文章元数据，其后是 Markdown 正文。保存后首页的文章列表会更新；打开 `/posts/first-post` 可以查看正文。示例文章设置了 `top: 1`，因此仍会排在新文章前面。

也可以在项目目录运行 `pnpm exec valaxy new first-post` 生成文章文件，再编辑内容。文章文件已存在时，这条命令会创建带编号的新文件，请查看命令输出中的路径。

### 配置站点 {#config}

修改 **`site.config.ts`** 中对应的字段，设置站点标题、作者和描述。例如：

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://example.com/',
  lang: 'zh-CN',
  timezone: 'Asia/Shanghai',
  title: '我的博客',
  author: {
    name: '小明',
  },
  description: '记录生活与技术。',
})
```

`url` 是正式部署地址，用于文章链接、站点地图和 RSS；上线前请将 `https://example.com/` 替换为你自己的网址。它不会改变开发服务器地址。保存后，检查浏览器标题、侧边栏站点名称和文章作者是否更新。

保留 `timezone`，或改成你的站点时区（如 `UTC`）。明确时区可让构建环境和不同时区的访客看到一致的文章时间。`valaxy new` 生成的时间包含时区偏移；手写日期时可以使用上面的 `YYYY-MM-DD`，需要精确时间则使用带偏移的格式，例如 `2026-10-05T14:30:00+08:00`。

**`valaxy.config.ts`** 用于主题和框架选项。Yun 模板中的首页大字单独由 `themeConfig.banner.title` 控制，将它改成你希望显示的文字即可。模板中的社交链接、赞助信息和页脚备案信息也是示例，上线前请修改或关闭。

更多选项参见 [站点配置](/zh/guide/config/) 和 [自定义扩展](/zh/guide/custom/extend)。

### 首次生产构建 {#first-build}

完成编辑后，停止开发服务器，在项目目录运行：

```bash
pnpm build
pnpm serve
```

模板中的 `build` 执行 `valaxy build --ssg`，预渲染页面到 **`dist/`**。等待命令成功退出后再运行 `pnpm serve`；它预览刚刚生成的构建产物，默认地址为 `http://localhost:4173/`，实际地址以终端为准。

检查以下结果：

- 首页显示新站点名称，并能点击进入新文章。
- 直接打开 `/posts/first-post`，正文正常显示；刷新后仍能访问。
- `dist/index.html` 和 `dist/posts/first-post.html` 已生成，包含对应页面内容。
- `dist/sitemap.xml` 与 `dist/atom.xml` 使用你在 `site.config.ts` 设置的站点地址。

`pnpm serve` 不会重新构建。后续修改需要再次执行 `pnpm build`。构建产物可按 [部署指南](/zh/guide/deploy) 部署到静态托管服务。

## 部署 {#deployment}

将构建生成的 `dist/` 部署到静态托管服务，具体步骤参见 [部署指南](/zh/guide/deploy)。

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
  - 可选安装 [Valaxy VS Code 扩展](/zh/ecosystem/vscode)，在编辑器中查看文章列表和本地站点预览。安装步骤、配置和兼容性说明请参阅扩展文档。
- `.github`: 使用 GitHub Actions 自动构建并部署到 GitHub Pages
- `netlify.toml`: [Netlify](https://www.netlify.com/) 自动配置
- `vercel.json`: [Vercel](https://vercel.com/) 重定向配置



## 主题 {#themes}


如果您希望自己开发一个主题并发布，您可以参考 [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter)。

更多内容请参见 [如何编写一个 Valaxy 主题](/zh/themes/write)。


## 社区 {#community}


如果你有疑问或者需要帮助，可以到 [Discord](https://discord.gg/nd3mPkU5j8) 和 [GitHub Discussions](https://github.com/YunYouJun/valaxy/discussions) 社区来寻求帮助。
