---
title: Commands
categories:
  - guide
top: 99
---


Valaxy has a commandline tool. You can use `valaxy` or `vala` to execute the following commands.

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


## Usage


### Local


You can configure shortcut scripts in `package.json`. (**Suggested**)

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


For example, you can use `npm run dev` to run the project, use `npm run build` to build
SSG site followed by building RSS source, and use `pnpm new post-title` to create a new
post called `post-title` under the `posts` folder.


### Global


You can also install Valaxy globally to use `valaxy` command globally. (**Optional**)

```bash
pnpm add -g valaxy
```


## Useful Commands


- `valaxy .`: Start Valaxy. The default directory is current directory. (`.` is optional)
- `valaxy rss`: Generate RSS
- `valaxy build`: Use Vite to build SPA app by default
- `valaxy build --ssg`: Build static pages (Memory-friendly, recommended), uses the built-in Valaxy SSG engine


## SSG Engine


Valaxy uses a built-in SSG (Static Site Generation) engine (Vue SSR + pure string rendering, no JSDOM) to generate static pages with `valaxy build --ssg`.

::: tip
The legacy JSDOM-based `vite-ssg` engine was **removed in v1.0** (it was broken under pnpm; see [#706](https://github.com/YunYouJun/valaxy/issues/706)). There is now a single engine — no `--ssg-engine` flag needed.
:::

### How It Works

The Valaxy SSG engine runs in three phases:

1. **Client Build** — Vite builds client assets (with `ssrManifest` enabled)
2. **Server Build** — Builds the SSR entry (`entry-ssr.ts`), producing a render function executable in Node.js
3. **Render** — Loads the SSR entry, iterates over routes, calls Vue's `renderToString` for HTML, injects `<head>` tags / preload links / initial state via pure string replacement, and writes to disk

Since it does not rely on JSDOM, per-page rendering has minimal memory overhead, enabling high concurrency (default 20) and fast, stable builds. Flash-of-unstyled-content is handled by the [FOUC guard](./config/extend) rather than Critical CSS inlining.


### Posts


- `valaxy new <title>`: Create a post (.md) titled `title` under the directory `pages/posts`.

For example, `valaxy new your-first-post` will create a file `your-first-post.md` under `pages/posts`,
and update the date.

> Do you think you have other more useful or better commands? That's great! Please report that by creating
> an issue at [GitHub Issues](https://github.com/YunYouJun/valaxy/issues)!

- [自定义文章模板](/guide/custom/templates)

## FAQ


### More logs when developing and less when building?


- The default log level is `info` when developing (`valaxy`) and building (`valaxy build`).
- Options: ['error', 'warn', 'info', 'silent']

You can use arguments to set the log level.

For example, `valaxy build --log=info`.


### Miss `hexo deploy` from Hexo?


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

