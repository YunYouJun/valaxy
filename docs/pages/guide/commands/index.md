---
title:
  en: Commands
  zh-CN: 命令行
categories:
  - guide
top: 99
---

::: zh-CN
Valaxy 内置了辅助命令行，你可使用 `valaxy` 或缩写 `vala` 来执行以下命令。
:::

::: en
Valaxy has a commandline tool. You can use `valaxy` or `vala` to execute the following commands.
:::

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

## 使用 {lang="zh-CN"}

## Usage {lang="en"}

### 局部使用 {lang="zh-CN"}

### Local {lang="en"}

::: zh-CN
你可以在项目的 `package.json` 中配置快捷脚本。（**推荐**）
:::

::: en
You can configure shortcut scripts in `package.json`. (**Suggested**)
:::

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

::: zh-CN
譬如通过 `npm run dev` 启动项目，通过 `npm run build` 可以在构建生成 ssg 站点后，再构建 RSS 源。
通过 `pnpm new post-title` 在 `posts` 文件夹下新建一个名为 `post-title` 的文章。
:::

::: en
For example, you can use `npm run dev` to run the project, use `npm run build` to build
SSG site followed by building RSS source, and use `pnpm new post-title` to create a new
post called `post-title` under the `posts` folder.
:::

### 全局安装 {lang="zh-CN"}

### Global {lang="en"}

::: zh-CN
你也可以全局安装 valaxy 以在全局使用 `valaxy` 命令。（**非必须**）
:::

::: en
You can also install Valaxy globally to use `valaxy` command globally. (**Optional**)
:::

```bash
pnpm add -g valaxy
```

## 常用命令 {lang="zh-CN"}

## Useful Commands {lang="en"}

::: zh-CN

- `valaxy .`: 启动 Valaxy，默认目录为当前目录（`.` 可不写）
- `valaxy rss`: 自动生成 RSS
- `valaxy build`: 默认采用 Vite 构建 SPA 应用
- `valaxy build --ssg`: 构建静态页面站点（内存友好，推荐），默认使用 Valaxy 内置 SSG 引擎
- `valaxy build --ssg --ssg-engine vite-ssg`: 使用传统 vite-ssg 引擎构建

:::

::: en

- `valaxy .`: Start Valaxy. The default directory is current directory. (`.` is optional)
- `valaxy rss`: Generate RSS
- `valaxy build`: Use Vite to build SPA app by default
- `valaxy build --ssg`: Build static pages (Memory-friendly, recommended), uses the built-in Valaxy SSG engine by default
- `valaxy build --ssg --ssg-engine vite-ssg`: Build with the legacy vite-ssg engine

:::

## SSG 引擎 {lang="zh-CN"}

## SSG Engines {lang="en"}

::: zh-CN

Valaxy 提供了两种 SSG（Static Site Generation）引擎用于生成静态页面。可通过 `--ssg-engine` 参数选择：

| | Valaxy SSG（默认） | vite-ssg（传统） |
| --- | --- | --- |
| 命令 | `valaxy build --ssg` | `valaxy build --ssg --ssg-engine vite-ssg` |
| 渲染方式 | Vue SSR + 纯字符串拼接 | JSDOM 模拟浏览器环境 |
| 最低堆内存 | **~2 GB** | ~2.3 GB |
| 内存占用原因 | 无 JSDOM 开销，每页渲染仅产生轻量字符串 | 每页创建 JSDOM 实例（~30-50 MB）+ beasties CSS 处理 |
| Critical CSS | 不支持（无 DOM 环境） | 支持（通过 beasties） |
| 并发渲染 | 默认 20 并发 | 根据堆内存动态调整（1-16 并发） |
| 依赖 | 无额外依赖 | 需要 `vite-ssg`、`jsdom` |

### 工作原理

**Valaxy SSG 引擎**（默认）分为三个阶段：

1. **Client Build** — 使用 Vite 构建客户端产物（启用 `ssrManifest`）
2. **Server Build** — 构建 SSR 入口（`entry-ssr.ts`），生成可在 Node.js 中执行的渲染函数
3. **Render** — 加载 SSR 入口，遍历路由，调用 Vue 的 `renderToString` 生成 HTML，通过纯字符串替换注入 `<head>` 标签、preload 链接和初始状态，写入磁盘

由于不依赖 JSDOM，每页渲染的内存开销极低，因此可以使用更高的并发数（默认 20），整体构建速度更快且更稳定。

**vite-ssg 引擎**（传统）的工作方式类似，但在渲染阶段使用 JSDOM 模拟完整的浏览器 DOM 环境，这会带来显著的内存开销，且支持 beasties 进行 Critical CSS 内联。

### 如何选择

- **推荐使用默认的 Valaxy SSG 引擎**，它内存占用更低、速度更快、无额外依赖
- 如果你依赖 Critical CSS（beasties）功能，或遇到新引擎的兼容性问题，可以回退到 `--ssg-engine vite-ssg`

:::

::: en

Valaxy provides two SSG (Static Site Generation) engines for generating static pages. Use the `--ssg-engine` flag to choose:

| | Valaxy SSG (default) | vite-ssg (legacy) |
| --- | --- | --- |
| Command | `valaxy build --ssg` | `valaxy build --ssg --ssg-engine vite-ssg` |
| Rendering | Vue SSR + pure string operations | JSDOM browser emulation |
| Min heap memory | **~2 GB** | ~2.3 GB |
| Memory cost | No JSDOM overhead; lightweight strings per page | JSDOM instance per page (~30-50 MB) + beasties CSS |
| Critical CSS | Not supported (no DOM) | Supported (via beasties) |
| Concurrency | Default 20 | Dynamically adjusted by heap (1-16) |
| Dependencies | None extra | Requires `vite-ssg`, `jsdom` |

### How It Works

**Valaxy SSG Engine** (default) runs in three phases:

1. **Client Build** — Vite builds client assets (with `ssrManifest` enabled)
2. **Server Build** — Builds the SSR entry (`entry-ssr.ts`), producing a render function executable in Node.js
3. **Render** — Loads the SSR entry, iterates over routes, calls Vue's `renderToString` for HTML, injects `<head>` tags / preload links / initial state via pure string replacement, and writes to disk

Since it does not rely on JSDOM, per-page rendering has minimal memory overhead, enabling higher concurrency (default 20) and faster, more stable builds.

**vite-ssg Engine** (legacy) works similarly but uses JSDOM to emulate a full browser DOM during rendering, incurring significant memory overhead. It supports beasties for Critical CSS inlining.

### Which to Choose

- **The default Valaxy SSG engine is recommended** — lower memory usage, faster, no extra dependencies
- If you rely on Critical CSS (beasties) or encounter compatibility issues with the new engine, fall back to `--ssg-engine vite-ssg`

:::

### 文章 {lang="zh-CN"}

### Posts {lang="en"}

::: zh-CN

- `valaxy new <title>`: 在 `pages/posts` 目录下新建标题为 `title` 的帖子（.md）
  - `-f` 以文件夹的形式创建。

譬如：

- `valaxy new your-first-post`，将会在 `pages/posts` 下自动新建 `your-first-post.md` 文件，并附带日期。
- `valaxy new -f your-first-post`，将会在 `pages/posts` 下自动新建 `your-first-post/index.md` 文件。

> 你觉得还可以有其他更常用、更好用的命令？没问题，尽管来 [Issues](https://github.com/YunYouJun/valaxy/issues) 反馈吧！
:::

::: en

- `valaxy new <title>`: Create a post (.md) titled `title` under the directory `pages/posts`.

For example, `valaxy new your-first-post` will create a file `your-first-post.md` under `pages/posts`,
and update the date.

> Do you think you have other more useful or better commands? That's great! Please report that by creating
> an issue at [GitHub Issues](https://github.com/YunYouJun/valaxy/issues)!
:::

- [自定义文章模板](/guide/custom/templates)

## FAQ

### 控制台开发时日志太少，构建时日志太多？ {lang="zh-CN"}

### More logs when developing and less when building? {lang="en"}

::: zh-CN

- 开发与（`valaxy`）构建（`valaxy build`）时默认日志等级为 `info`
- 可选项：['error', 'warn', 'info', 'silent']

您可以通过设置日志等级控制。

譬如 `valaxy build --log=warn`。
:::

::: en

- The default log level is `info` when developing (`valaxy`) and building (`valaxy build`).
- Options: ['error', 'warn', 'info', 'silent']

You can use arguments to set the log level.

For example, `valaxy build --log=info`.
:::

### 怀念 Hexo 的 `hexo deploy`? {lang="zh-CN"}

### Miss `hexo deploy` from Hexo? {lang="en"}

::: zh-CN

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

:::

::: en

When you create a Valaxy project, a `.github/workflows/gh-pages.yml` file is included. When you push to GitHub, it will automatically build and deploy to GitHub Pages.

If you only want to deploy the `gh-pages` branch and really want to use `deploy`.

You can also install `pnpm add -D gh-pages` and configure shortcut scripts in `package.json`.

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

:::
