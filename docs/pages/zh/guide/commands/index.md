---
title: 命令行
categories:
  - guide
top: 99
---

Valaxy 内置了辅助命令行，你可使用 `valaxy` 或缩写 `vala` 来执行以下命令。


```bash
valaxy [args]

Commands:
  valaxy [root]        Start a local server for Valaxy                 [default]
  valaxy build [root]  build your blog to static content
  valaxy rss [root]    generate rss feed
  valaxy new <title>   Draft a new post

Positionals:
  root  root folder of your source files                 [string] [default: "."]

Options:
  -p, --port     port                                                   [number]
  -o, --open     open in browser                      [boolean] [default: false]
      --remote   listen public host and enable remote control
                                                       [boolean] [default: true]
      --log      log level
         [string] [choices: "error", "warn", "info", "silent"] [default: "info"]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```

## 使用 {#usage}


### 局部使用 {#local}


你可以在项目的 `package.json` 中配置快捷脚本。（**推荐**）


```json
{
  "scripts": {
    "build": "npm run build:ssg",
    "build:spa": "valaxy build",
    "build:ssg": "valaxy build --ssg",
    "dev": "valaxy dev",
    "new": "valaxy new",
    "rss": "valaxy rss"
  }
}
```

譬如通过 `npm run dev` 启动项目，通过 `npm run build` 可以在构建生成 ssg 站点后，再构建 RSS 源。
通过 `pnpm new post-title` 在 `posts` 文件夹下新建一个名为 `post-title` 的文章。


### 全局安装 {#global}


你也可以全局安装 valaxy 以在全局使用 `valaxy` 命令。（**非必须**）


```bash
pnpm add -g valaxy
```

## 常用命令 {#useful-commands}



- `valaxy .`: 启动 Valaxy，默认目录为当前目录（`.` 可不写）
- `valaxy rss`: 自动生成 RSS
- `valaxy build`: 默认采用 Vite 构建 SPA 应用
- `valaxy build --ssg`: 构建静态页面站点（内存友好，推荐），使用 Valaxy 内置 SSG 引擎



## SSG 引擎 {#ssg-engines}



Valaxy 使用内置的 SSG（Static Site Generation）引擎（Vue SSR + 纯字符串渲染，无 JSDOM），通过 `valaxy build --ssg` 生成静态页面。

::: tip
基于 JSDOM 的传统 `vite-ssg` 引擎已在 **v1.0 中移除**（它在 pnpm 下损坏，详见 [#706](https://github.com/YunYouJun/valaxy/issues/706)）。现在只有单一引擎，无需 `--ssg-engine` 参数。
:::

### 工作原理 {#how-it-works}

Valaxy SSG 引擎分为三个阶段：

1. **Client Build** — 使用 Vite 构建客户端产物（启用 `ssrManifest`）
2. **Server Build** — 构建 SSR 入口（`entry-ssr.ts`），生成可在 Node.js 中执行的渲染函数
3. **Render** — 加载 SSR 入口，遍历路由，调用 Vue 的 `renderToString` 生成 HTML，通过纯字符串替换注入 `<head>` 标签、preload 链接和初始状态，写入磁盘

由于不依赖 JSDOM，每页渲染的内存开销极低，因此可以使用更高的并发数（默认 20），整体构建速度更快且更稳定。首屏无样式闪烁由 [FOUC guard](./config/extend) 处理，而非 Critical CSS 内联。



### 文章 {#posts}



- `valaxy new <title>`: 在 `pages/posts` 目录下新建标题为 `title` 的帖子（.md）
  - `-f` 以文件夹的形式创建。

譬如：

- `valaxy new your-first-post`，将会在 `pages/posts` 下自动新建 `your-first-post.md` 文件，并附带日期。
- `valaxy new -f your-first-post`，将会在 `pages/posts` 下自动新建 `your-first-post/index.md` 文件。

> 你觉得还可以有其他更常用、更好用的命令？没问题，尽管来 [Issues](https://github.com/YunYouJun/valaxy/issues) 反馈吧！


- [自定义文章模板](/zh/guide/custom/templates)

## FAQ {#faq}

### 控制台开发时日志太少，构建时日志太多？ {#more-logs-when-developing-and-less-when-building}



- 开发与（`valaxy`）构建（`valaxy build`）时默认日志等级为 `info`
- 可选项：['error', 'warn', 'info', 'silent']

您可以通过设置日志等级控制。

譬如 `valaxy build --log=warn`。


### 怀念 Hexo 的 `hexo deploy`? {#miss-hexo-deploy-from-hexo}



在创建 Valaxy 项目时，已内置了 `.github/workflows/gh-pages.yml`，在推送至 GitHub 时，会自动构建并部署到 GitHub Pages。

如果你仅想部署 `gh-pages` 分支，并且真的很想使用 `deploy`。
你也可以安装 `pnpm add -D gh-pages`，并在项目的 `package.json` 中配置快捷脚本。

```json
{
  "scripts": {
    "deploy": "valaxy build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "latest"
  }
}
```



