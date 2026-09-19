---
title: Arknights Theme
categories: Themes
---

# Arknights Theme

**valaxy-theme-arknights** is a working AI theme authoring example for Valaxy. It applies AK UI at `system` intensity: cool paper and graphite surfaces, yellow actions, original industrial geometry and an archive driven by real posts. Article layouts keep a comfortable measure and clear hierarchy.

- [Source and updates](https://github.com/valaxyjs/valaxy-theme-arknights)
- [中文使用文档](/zh/themes/arknights)
- [AI design brief and theme Skill](/themes/write#generate-a-theme-with-ai)
- [AK UI design language and Skill](https://ak-ui.yyj.moe/)
- [Official theme starter](https://github.com/valaxyjs/valaxy-theme-starter)

![Arknights homepage with a featured entry and real post archive](/themes/arknights-preview.webp)

## Run the example

Requires Node.js **22.12+** and pnpm **10**. Verified with Valaxy **1.0.0-rc.11** and AK UI **1.1.0**.

```bash
pnpm dlx degit valaxyjs/valaxy-theme-arknights my-arknights-blog
cd my-arknights-blog
pnpm install
pnpm dev
```

`theme/` contains the distributable theme source; `demo/` is its consuming blog. This is currently a source example, **not an npm release**. Use the source or archive installation below instead of `pnpm add valaxy-theme-arknights`.

## Configure your blog

Edit `demo/site.config.ts` for title, description, author, URL and `lang`. `zh-CN` selects Chinese interface labels; other languages select English. All sample identity and article content can be replaced.

Configure the theme in `demo/valaxy.config.ts`:

```ts
import type { ThemeConfig } from 'valaxy-theme-arknights'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'arknights',
  themeConfig: {
    eyebrow: 'MY FIELD NOTES',
    motto: 'Observe. Record. Share.',
    accent: '#ffd84a',
    outline: 'deep',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Archive', link: '/archives/' },
      { text: 'About', link: '/about/' },
      { text: 'GitHub', link: 'https://github.com/your-name' },
    ],
    footer: 'Notes worth keeping.',
  },
})
```

| Option | Default | Purpose |
| --- | --- | --- |
| `eyebrow` | `PERSONAL FIELD NOTES` | Short label above the homepage title |
| `motto` | `Observe. Record. Share.` | Short sentence at the foot of the hero |
| `accent` | `#ffd84a` | Action and illustration color; keep contrast with dark button text |
| `nav` | `[]` | Defaults to Home and Archive; custom links serve desktop and mobile |
| `outline` | `'deep'` | Heading range: a level, `[min, max]`, `'deep'`, or `false` |
| `footer` | `''` | Optional footer text |

Navigation supports internal paths, `https:` and `mailto:` links. Create the ordinary pages your navigation points to.

## Write posts and pages

Create `demo/pages/posts/hello.md`:

```md
---
title: My first field note
description: A short plain-text introduction.
date: 2026-09-19
tags: [Life, Notes]
top: 1
---

## Start here

Your writing is still ordinary Markdown.
```

Cards use `description` as a plain-text summary. The first post in Valaxy's sorted list becomes the featured entry; use `top` to pin posts. `draft: true` excludes a post from production lists. Search matches titles and combines with tag filtering; it is not full-text search.

Create `demo/pages/about.md` for `/about/`. Supported layouts are `home`, `post`, `default` and `404`. The theme supplies `/`, `/archives/` and `/404`; user pages at matching paths take precedence. Article content is statically rendered; the outline is derived from actual headings after hydration.

## Use in an existing blog

In the theme workspace:

```bash
pnpm check
pnpm pack:theme
```

Then install the generated archive in your existing Valaxy blog, replacing the path:

```bash
pnpm add /absolute/path/to/artifacts/valaxy-theme-arknights-0.1.0.tgz
```

Set `theme: 'arknights'` in that blog's `valaxy.config.ts`. Keep your own `site.config.ts` and `pages/`. The archive includes components, layouts, styles and types, and installs AK UI as a runtime dependency. No link to a developer checkout is needed.

## Build and deploy

```bash
pnpm build
```

The example's build script explicitly runs SSG and writes `demo/dist`, ready for a static host.

The example’s `demo/vite.config.ts` maps `VITE_BASE` to Vite’s `base`. In an existing blog, also set `base` in your own `vite.config.ts` or connect the same environment variable. For subdirectory hosting, use matching `VITE_BASE` and `siteConfig.url` values. On macOS/Linux:

```bash
VITE_BASE=/my-blog/ pnpm build
```

On PowerShell:

```powershell
$env:VITE_BASE = '/my-blog/'
pnpm build
```

The repository's manual Pages workflow uses `/valaxy-theme-arknights/`; update it when copying the repository. Deployment and npm publication are separate operations, not automatic effects of theme generation.

## Iterate with the updated AK UI Skill

```bash
pnpm dlx skills add YunYouJun/valaxy --skill valaxy-theme
pnpm dlx skills add YunYouJun/ak-ui --skill ak-ui
```

The theme Skill supplies Valaxy contracts and verification; the AK UI Skill supplies design and interaction guidance. Your brief supplies this task's requirements. Select **AK UI / Arknights** in the [generator](/themes/write#generate-a-theme-with-ai); select **Customize an existing theme** when evolving this one.

This example uses CSS Core and semantic tokens. AK UI 1.1's `/site` export supplies `createMobileMenu`: native dialog focus trapping, Escape and link dismissal, focus return and automatic closing at desktop widths. Without JavaScript, ordinary navigation remains available. Initialize the controller after mounting and destroy it on unmount; SSR and reduced motion remain supported.

Check the home page, long articles, filter empty states, both color schemes, mobile menus and keyboard navigation. For dependency/export changes, also build a fresh blog with the packed `.tgz` installed. The repository's `tests/browser_smoke.py` provides reusable regression coverage.

This independent, unofficial theme is not affiliated with Arknights or its rights holders and contains no game assets. Code is MIT licensed.
