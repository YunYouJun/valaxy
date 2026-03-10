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

## 使用


### 局部使用


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


### 全局安装


你也可以全局安装 valaxy 以在全局使用 `valaxy` 命令。（**非必须**）


```bash
pnpm add -g valaxy
```

## 常用命令



- `valaxy .`: 启动 Valaxy，默认目录为当前目录（`.` 可不写）
- `valaxy rss`: 自动生成 RSS
- `valaxy build`: 默认采用 Vite 构建 SPA 应用
- `valaxy build --ssg`: 构建静态页面站点（内存友好，推荐），默认使用 Valaxy 内置 SSG 引擎
- `valaxy build --ssg --ssg-engine vite-ssg`: 使用传统 vite-ssg 引擎构建



## SSG 引擎



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



### 文章



- `valaxy new <title>`: 在 `pages/posts` 目录下新建标题为 `title` 的帖子（.md）
  - `-f` 以文件夹的形式创建。

譬如：

- `valaxy new your-first-post`，将会在 `pages/posts` 下自动新建 `your-first-post.md` 文件，并附带日期。
- `valaxy new -f your-first-post`，将会在 `pages/posts` 下自动新建 `your-first-post/index.md` 文件。

> 你觉得还可以有其他更常用、更好用的命令？没问题，尽管来 [Issues](https://github.com/YunYouJun/valaxy/issues) 反馈吧！


- [自定义文章模板](/zh/guide/custom/templates)

## FAQ

### 控制台开发时日志太少，构建时日志太多？



- 开发与（`valaxy`）构建（`valaxy build`）时默认日志等级为 `info`
- 可选项：['error', 'warn', 'info', 'silent']

您可以通过设置日志等级控制。

譬如 `valaxy build --log=warn`。


### 怀念 Hexo 的 `hexo deploy`?



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



