---
title: Commands
title_zh-CN: 命令行
categories:
  - Guide
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
    "build": "npm run build:ssg && npm run rss",
    "build:spa": "valaxy build",
    "build:ssg": "valaxy build --ssg",
    "dev": "valaxy .",
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
- `valaxy build --ssg`: 使用 vite-ssg 构建静态页面站点（SEO 友好，推荐）

:::

::: en

- `valaxy .`: Start Valaxy. The default directory is current directory. (`.` is optional)
- `valaxy rss`: Generate RSS
- `valaxy build`: Use Vite to build SPA app by default
- `valaxy build --ssg`: Use vite-ssg to build static web page (SEO-friendly, recommended)

:::

## 文章 {lang="zh-CN"}

## Posts {lang="en"}

::: zh-CN

- `valaxy new <title>`: 在 `pages/posts` 目录下新建标题为 `title` 的帖子（.md）

譬如，`valaxy new your-first-post`，将会在 `pages/posts` 下自动新建 `your-first-post.md` 文件，并附带日期。

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

- 开发时（`valaxy`）默认日志等级为 `info`
- 构件时（`valaxy build`）默认日志等级为 `warn`

您可以通过设置日志等级控制。

譬如 `valaxy build --log=info`。
:::

::: en

- When developing (`valaxy`), the default log level is `info`
- When building (`valaxy build`), the default log level is `warn`

You can use arguments to set the log level.

For example, `valaxy build --log=info`.
:::
