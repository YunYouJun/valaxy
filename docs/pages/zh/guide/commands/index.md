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
- `valaxy build --ssg`: Build static pages (Memory-friendly, recommended), uses the built-in Valaxy SSG engine by default
- `valaxy build --ssg --ssg-engine vite-ssg`: Build with the legacy vite-ssg engine


## SSG Engines


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

