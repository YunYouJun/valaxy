# My Valaxy blog

Follow the [Getting Started guide](https://valaxy.site/guide/getting-started) ([中文](https://valaxy.site/zh/guide/getting-started)). Requires Node.js `>=22.12.0` and pnpm `>=10.26.0`. Keep `pnpm-workspace.yaml`, which includes dependency build script permissions for installation.

## Usage

```bash
pnpm install
pnpm dev
```

Open the `Preview` address in the terminal (usually `http://localhost:4859/`). Leave the server running while editing; stop it with `Ctrl+C`.

### Write a post

Create `pages/posts/first-post.md`:

```md
---
title: My first post
date: 2026-10-05
---

Hello, Valaxy!
```

Use your publication date. Save the file, then open `/posts/first-post` or click its title on the home page. You can also generate a file with `pnpm exec valaxy new first-post` from a second terminal in this project.

### Config

Edit `site.config.ts` for `title`, `author.name`, `description`, `lang`, and your production `url`. The URL is used in post links, RSS, and the sitemap; replace the example before deployment.

Keep an explicit `timezone` (the Yun template uses `Asia/Shanghai`) so the build server and visitors display the same post times. For precise publication times, use an offset such as `2026-10-05T14:30:00+08:00`; `valaxy new` generates this format automatically.

Edit `valaxy.config.ts` for theme and framework options. Yun's large home page text uses `themeConfig.banner.title`. Replace or disable the template's example social links, sponsorship details, and footer registration information before deployment.

### Build and preview

Stop the development server, then run:

```bash
pnpm build
pnpm serve
```

The build prerenders pages into `dist/`. Open the preview address (usually `http://localhost:4173/`) and check the home page and `/posts/first-post`, including after a refresh. The corresponding files are `dist/index.html` and `dist/posts/first-post.html`.

Run `pnpm build` again after editing; `pnpm serve` only serves existing output. See the [deployment guide](https://valaxy.site/guide/deploy) to deploy `dist/`.

### Docker

```bash
docker build . -t your-valaxy-blog-name:latest
```

## Structure

In most cases, you only need to work in the `pages` folder.

### Main folders

- `pages`: your all pages
  - `posts`: write your posts here, will be counted as posts
- `styles`: override theme styles, `index.ts`/`index.scss`/`index.css` will be loaded automatically
- `components`: custom your vue components (will be loaded automatically)
- `layouts`: custom layouts (use it by `layout: xxx` in md)
- `locales`: custom i18n

### Other

- `.vscode`: recommend some useful plugins & settings, you can preview icon/i18n/class...
- `.github`: GitHub Actions to auto build & deploy to GitHub Pages
- `netlify.toml`: for [netlify](https://www.netlify.com/)
- `vercel.json`: for [vercel](https://vercel.com/)
