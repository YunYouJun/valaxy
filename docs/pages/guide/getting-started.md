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
> - `site.config.ts`: site information
> - `valaxy.config.ts`: theme and framework configuration
> - `package.json`: dependencies

### Locally

::: danger Version compatibility

Valaxy requires [Node.js](https://nodejs.org/) **`>=22.12.0`**. This guide uses [pnpm](https://pnpm.io/installation) **`>=10.26.0`** to support the template's `allowBuilds` dependency build permissions. Upgrade older versions before creating your project.

:::

Check your installed versions:

```bash
node --version
pnpm --version
```

Run this in the directory where you want to create your blog:

```bash
pnpm create valaxy@latest
```

Choose these answers in order:

1. `Select a type:` → **Blog**.
2. `Select a theme:` → **Yun**, the default blog theme used in this guide.
3. `Project name:` → **valaxy-blog**, or another directory that does not exist yet.
4. `Install and start it now?` → **No**, then install and start manually below. If you choose Yes, select pnpm and continue with “Write your first post” once the server starts.

::: details Example CLI prompts
<CreateValaxyTooltip />
:::

#### Select a Theme

- **Yun**: The default blog theme, used throughout this guide.
- **Press**: A documentation theme.
- **Custom**: Enter a theme name such as `starter` or `valaxy-theme-starter`.

The scaffolder configures the theme dependency and `valaxy.config.ts`. Press also has its own home page and configuration templates. Refer to the selected theme's documentation for its options.

## Usage

Enter the new project, install dependencies, and start the development server:

```bash
cd valaxy-blog
pnpm install
pnpm dev
```

Keep the generated `pnpm-workspace.yaml`: it contains dependency installation settings, including build script permissions. [pnpm 11 and later stop installation when dependency scripts have not been reviewed](https://pnpm.io/blog/releases/11.0). The template configures its current dependencies, so the initial install does not require an extra `approve-builds` step.

::: details Example output after a successful startup {open}
This example follows the actual output of the default Yun template, omitting timings and network addresses. Use the versions, project path, and port shown in your terminal.

<StartValaxyTooltip />
:::

Open the address printed after `Preview`, usually `http://localhost:4859/`. If that port is occupied, Valaxy chooses another available port, so use the terminal's address. The home page should show **Hello, Valaxy!**; click its title to open the example post.

`pnpm dev` keeps running. Leave this terminal open while editing the project. To run another command, open a second terminal in the same project directory. Stop the server with `Ctrl+C`.

### Write your first post {#first-post}

Create `pages/posts/first-post.md` with this content:

```md
---
title: My first post
date: 2026-10-05
tags:
  - Notes
---

## Hello, Valaxy

This is my first post.
```

Use your publication date. The block between `---` markers contains post metadata; the rest is Markdown content. Saving the file updates the home page's post list. Open `/posts/first-post` to read it. The example post has `top: 1`, so it stays above the new post.

Alternatively, run `pnpm exec valaxy new first-post` in the project directory to generate a post file, then edit it. If the file already exists, the command creates a numbered filename; check the path printed in the terminal.

### Configure your site {#config}

Edit the corresponding fields in **`site.config.ts`** to set your site title, author, and description. For example:

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://example.com/',
  lang: 'en',
  timezone: 'UTC',
  title: 'My blog',
  author: {
    name: 'Alex',
  },
  description: 'Notes on life and technology.',
})
```

`url` is your production address, used for post links, the sitemap, and RSS. Replace `https://example.com/` with your own address before deployment. It does not change the development server address. After saving, check the browser title, sidebar site name, and post author.

Keep `timezone`, or set it to your site's timezone, such as `Asia/Shanghai`. An explicit timezone keeps displayed post times consistent between the build server and visitors. `valaxy new` includes a timezone offset in its timestamps. When writing dates manually, use `YYYY-MM-DD` as above, or include an offset for a precise time, such as `2026-10-05T14:30:00+08:00`.

**`valaxy.config.ts`** contains theme and framework options. The large text on the Yun home page is configured separately through `themeConfig.banner.title`. Change it to your preferred text. The template's social links, sponsorship details, and footer registration information are also examples; replace or disable them before deployment.

See [Site configuration](/guide/config/) and [Custom extensions](/guide/custom/extend) for more options.

### Your first production build {#first-build}

Stop the development server, then run these commands in your project:

```bash
pnpm build
pnpm serve
```

The template's `build` script runs `valaxy build --ssg`, prerendering pages into **`dist/`**. Wait for the build to exit successfully before running `pnpm serve`. It previews the generated output, usually at `http://localhost:4173/`; use the address printed in the terminal.

Check that:

- The home page shows your site name and links to your new post.
- Opening `/posts/first-post` directly shows the article, including after a refresh.
- `dist/index.html` and `dist/posts/first-post.html` contain the corresponding page content.
- `dist/sitemap.xml` and `dist/atom.xml` use the site address from `site.config.ts`.

`pnpm serve` does not rebuild your site. Run `pnpm build` again after editing. Follow the [deployment guide](/guide/deploy) to upload the output to a static host.

## Deployment

Deploy the generated `dist/` directory to a static host. See the [deployment guide](/guide/deploy) for the steps.

## Upgrading


::: code-group

```bash [pnpm]
cd your-blog
# upgrade valaxy
pnpm add valaxy@latest
# upgrade theme
pnpm add valaxy-theme-yun@latest
```

```bash [bun]
cd your-blog
# upgrade valaxy
bun add valaxy@latest
# upgrade theme
bun add valaxy-theme-yun@latest
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
- `styles`: override theme styles, `index.scss`/`css-vars.scss`/`index.css` will be loaded automatically
- `components`: custom your vue components (will be loaded automatically)
- `layouts`: custom layouts (use it by `layout: xxx` in md)
- `locales`: custom i18n


### Others


- `.vscode`: recommend some useful plugins & settings, you can preview icon/i18n/class...
  - Optionally install the [Valaxy VS Code extension](/ecosystem/vscode) for a post list and local site preview. See its documentation for setup, settings, and compatibility notes.
- `.github`: GitHub Actions to auto build & deploy to GitHub Pages
- `netlify.toml`: for [netlify](https://www.netlify.com/)
- `vercel.json`: for [vercel](https://vercel.com/)


## Themes


If you want to develop a theme and released, you can refer to [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter).


## Community


If you have questions or need help, you can go to the [Discord](https://discord.gg/nd3mPkU5j8) and [Discussions](https://github.com/YunYouJun/valaxy/discussions) to ask for help.
