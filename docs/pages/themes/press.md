---
title: Theme Press
categories:
  - theme
---

::: tip
Type definitions: [valaxy-theme-press/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/types/index.d.ts)
:::

`valaxy-theme-press` is the official documentation theme for Valaxy. It is inspired by VitePress, but it runs on Valaxy's routing, Markdown, addon, i18n, and blog data systems.

Use it when your site is primarily documentation, a project handbook, a knowledge base, or a docs site that still needs Valaxy features such as posts, categories, tags, addons, and custom Vue components.

## Quick Start {#quick-start}

The easiest path is to choose **Press** when creating a new Valaxy site:

```bash
pnpm create valaxy
```

For an existing Valaxy site, install the theme and set `theme` to `press`:

```bash
pnpm add valaxy-theme-press
```

```ts [valaxy.config.ts]
import type { PressTheme } from 'valaxy-theme-press'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<PressTheme.Config>({
  theme: 'press',
  themeConfig: {
    logo: '/favicon.svg',
  },
})
```

You can also move theme options into `theme.config.ts`:

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-press'

export default defineThemeConfig({
  logo: '/favicon.svg',
})
```

## Documentation Map {#documentation-map}

- [Config Reference](/themes/press/config): `themeConfig` options, home page, footer, layouts, styling, and component overrides.
- [Navigation And Sidebar](/themes/press/sidebar-nav): top nav, category sidebar, explicit sidebar trees, multi-sidebars, and `base`.
- [Search And i18n](/themes/press/search-i18n): local search, Fuse, Algolia, locale switcher, and per-locale config.
- [Migrating From VitePress](/themes/press/migration): config mapping and migration notes for VitePress users.

## Minimal Docs Site {#minimal-docs-site}

A practical documentation site usually configures site metadata, search, navigation, a sidebar, edit links, and footer text:

```ts [valaxy.config.ts]
import type { PressTheme } from 'valaxy-theme-press'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    title: 'Acme Docs',
    url: 'https://docs.example.com',
    description: 'Documentation for Acme',
    search: {
      enable: true,
      provider: 'local',
    },
    lastUpdated: true,
  },

  theme: 'press',
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: 'getting-started' },
              { text: 'Configuration', link: 'config' },
            ],
          },
        ],
      },
    },
    editLink: {
      pattern: 'https://github.com/acme/project/edit/main/docs/:path',
      text: 'Edit this page',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2026 Acme.',
    },
  },
})
```

The Valaxy documentation itself is the largest real-world example of Press. See [docs/valaxy.config.ts](https://github.com/YunYouJun/valaxy/blob/main/docs/valaxy.config.ts) for a complete configuration.
