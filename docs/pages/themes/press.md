---
title: Theme Press
categories:
  - theme
---

::: tip
Type definitions: [valaxy-theme-press/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/types/index.d.ts)
:::

`valaxy-theme-press` is the official documentation theme for Valaxy. It is inspired by VitePress, but it runs on Valaxy's routing, markdown, addon, i18n, and blog data systems.

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
      {
        text: 'Resources',
        items: [
          { text: 'Changelog', link: '/changelog/' },
          { text: 'GitHub', link: 'https://github.com/acme/project' },
        ],
      },
    ],

    sidebar: [
      'guide',
      {
        text: 'Reference',
        collapsed: false,
        items: [
          { text: 'Config', link: '/reference/config' },
          { text: 'CLI', link: '/reference/cli' },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/acme/project/edit/main/docs/:path',
      text: 'Edit this page',
    },

    socialLinks: [
      { icon: 'i-ri-github-line', link: 'https://github.com/acme/project' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2026 Acme.',
    },
  },
})
```

## Theme Config Reference {#theme-config-reference}

The table below lists the Press-specific `themeConfig` options. Site-wide options such as `title`, `url`, `search`, and `lastUpdated` still live under `siteConfig`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `logo` | `string` | `''` | Logo shown in the top nav. Use a public path such as `/favicon.svg`. |
| `colors.primary` | `string` | `'#0078E7'` | Primary color injected into Press SCSS and Valaxy theme variables. |
| `nav` | `NavItem[]` | `[]` | Top navigation links and dropdown groups. |
| `sidebar` | `Sidebar` | `[]` | Left sidebar. Supports category names, explicit trees, and multi-sidebars keyed by path. |
| `editLink.pattern` | `string` | Valaxy docs repository edit URL | URL template for the bottom "Edit this page" link. `:path` is replaced by the page relative path. |
| `editLink.text` | `string` | Locale text | Custom edit-link label. |
| `footer.message` | `string` | `undefined` | Footer message. HTML is allowed. |
| `footer.copyright` | `string` | `undefined` | Footer copyright text. HTML is allowed. |
| `socialLinks` | `SocialLink[]` | `[]` | Icon links rendered in the nav. Icons use UnoCSS icon classes such as `i-ri-github-line`. |
| `locales` | `Record<string, LocaleSpecificConfig>` | `undefined` | Locale switcher data and per-locale `themeConfig` overrides. |
| `i18nRouting` | `boolean` | `false` | Preserve the current route path when switching locales. |

## Home Page {#home-page}

Use `layout: home` and configure the hero and features in frontmatter.

```md [pages/index.md]
---
layout: home

title: Acme Docs

hero:
  name: Acme
  text: Build faster with Acme
  tagline: Everything you need to install, configure, and extend Acme.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
      type: fly
    - theme: alt
      text: View on GitHub
      link: https://github.com/acme/project

features:
  - icon: i-logos:vitejs
    title: Fast
    details: Powered by Vite and Valaxy.
  - icon: i-logos:vue
    title: Extensible
    details: Use Vue components directly in Markdown.
---
```

Internal action links are adjusted automatically when `i18nRouting` is enabled.

## Navigation {#nav}

`themeConfig.nav` controls the top navigation. A nav item can be a direct link or a dropdown group.

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      {
        text: 'Ecosystem',
        items: [
          { text: 'Addons', link: '/addons/' },
          { text: 'Themes', link: '/themes/' },
        ],
      },
    ],
  },
})
```

`text` can be plain text or an i18n key from your `locales/*.yml` files.

## Sidebar {#sidebar}

Press supports two common sidebar styles.

The first style is category-driven. Add a category name to `themeConfig.sidebar`, then mark pages with the same `categories` value:

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: ['guide', 'reference'],
  },
})
```

```md [pages/guide/getting-started.md]
---
title: Getting Started
categories:
  - guide
---
```

The second style is an explicit tree. Use this when you need exact order, nested groups, external links, or collapsible sections:

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/config' },
          {
            text: 'Advanced',
            collapsed: true,
            items: [
              { text: 'Markdown', link: '/guide/markdown' },
              { text: 'Deployment', link: '/guide/deploy' },
            ],
          },
        ],
      },
    ],
  },
})
```

`docFooterText` customizes the label shown in previous/next page navigation:

```ts
{
  text: 'Configuration',
  link: '/guide/config',
  docFooterText: 'Configure Valaxy',
}
```

## Search {#search}

Press renders the search box when `siteConfig.search.enable` is `true`.

For most documentation sites, use MiniSearch local search:

```ts [valaxy.config.ts]
export default defineValaxyConfig({
  siteConfig: {
    search: {
      enable: true,
      provider: 'local',
    },
  },
})
```

Press also supports Valaxy's Fuse provider:

```ts
export default defineValaxyConfig({
  siteConfig: {
    search: {
      enable: true,
      provider: 'fuse',
    },
  },
})
```

For Algolia DocSearch, set the provider to `algolia` and install the Algolia addon:

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonAlgolia } from 'valaxy-addon-algolia'

export default defineValaxyConfig({
  siteConfig: {
    search: {
      enable: true,
      provider: 'algolia',
    },
  },
  addons: [
    addonAlgolia({
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
    }),
  ],
})
```

Set `search: false` in page frontmatter to exclude one page from local search indexing.

## Multi-Language Sites {#i18n}

Use `locales` to configure the language switcher and per-locale theme overrides. Enable `i18nRouting` when switching languages should keep the current route path.

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    languages: ['en', 'zh-CN'],
  },
  themeConfig: {
    i18nRouting: true,
    locales: {
      root: {
        label: 'English',
        lang: 'en',
      },
      zh: {
        label: '简体中文',
        lang: 'zh-CN',
        link: '/zh/',
        themeConfig: {
          nav: [
            { text: '指南', link: '/zh/guide/getting-started' },
          ],
          sidebar: ['guide'],
          editLink: {
            pattern: 'https://github.com/acme/project/edit/main/docs/:path',
            text: '编辑此页',
          },
        },
      },
    },
  },
})
```

Place translated pages under the matching prefix:

```txt
pages/
├── guide/getting-started.md
└── zh/guide/getting-started.md
```

## Footer And Edit Link {#footer-edit-link}

The edit link appears at the bottom of article pages. `:path` is replaced with the current page relative path.

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    lastUpdated: true,
  },
  themeConfig: {
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

Set `nav: false` in page frontmatter to hide previous/next page navigation for that page.

## Page Layouts {#page-layouts}

Press provides these common layouts:

| Layout | Use case |
| --- | --- |
| `default` | Standard documentation page |
| `home` | Landing page with hero and features |
| `posts` | Post list page |
| `post` | Blog post detail page |
| `tags` | Tag archive page |
| `404` | Not found page |

Example archive pages:

```md [pages/posts/index.md]
---
title: Posts
layout: posts
---
```

```md [pages/tags/index.md]
---
title: Tags
layout: tags
---
```

## Styling {#styling}

Set the theme primary color through `themeConfig.colors.primary`:

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    colors: {
      primary: '#0078E7',
    },
  },
})
```

You can also override Press CSS variables in your own styles:

```scss [styles/index.scss]
:root {
  --pr-nav-height-mobile: 56px;
  --pr-nav-text: var(--va-c-text-1);
}
```

## Component Customization {#component-customization}

Like other Valaxy themes, Press components can be overridden by creating a component with the same name in your site. Common extension points include:

| Component | Purpose |
| --- | --- |
| `PressHomeHero.vue` | Home hero |
| `PressHomeFeatures.vue` | Home feature grid |
| `PressNavBar.vue` | Top navigation bar |
| `PressSidebar.vue` | Left sidebar |
| `PressDocFooter.vue` | Edit link and previous/next footer |
| `PressArticle.vue` | Documentation article wrapper |

For lower-level theme authoring details, see [Write A Theme](/themes/write).

## Migrating From VitePress {#migrating-from-vitepress}

Press intentionally feels familiar to VitePress users, but it is not a drop-in `.vitepress/config.ts` replacement.

- Move site and theme config into `valaxy.config.ts`, `site.config.ts`, or `theme.config.ts`.
- Put content in Valaxy's `pages/` directory.
- Use Valaxy frontmatter such as `categories`, `layout`, and `search`.
- Configure search through `siteConfig.search.provider`.
- Use Valaxy addons when you need integrations such as Algolia, Git log contributors, comments, or music.

Common mappings:

| VitePress | Valaxy + Press |
| --- | --- |
| `.vitepress/config.ts` | `valaxy.config.ts`, `site.config.ts`, or `theme.config.ts` |
| `title`, `description` | `siteConfig.title`, `siteConfig.description` |
| `themeConfig.logo` | `themeConfig.logo` |
| `themeConfig.nav` | `themeConfig.nav` |
| `themeConfig.sidebar` | `themeConfig.sidebar` |
| `themeConfig.socialLinks` | `themeConfig.socialLinks` |
| `themeConfig.editLink` | `themeConfig.editLink` |
| `themeConfig.footer` | `themeConfig.footer` |
| `lastUpdated` | `siteConfig.lastUpdated` |
| `locales` | `themeConfig.locales` plus `siteConfig.languages` |
| `themeConfig.search.provider: 'local'` | `siteConfig.search.provider: 'local'` |
| `.vitepress/theme` custom layout/components | Same-name component overrides in the Valaxy site |
| VitePress plugins | Valaxy addons or Vite plugins in `valaxy.config.ts` |

The Valaxy documentation itself is the largest real-world example of Press. See [docs/valaxy.config.ts](https://github.com/YunYouJun/valaxy/blob/main/docs/valaxy.config.ts) for a complete configuration.
