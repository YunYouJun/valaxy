---
title: Theme Yun Config
categories:
  - theme
---

## Theme Type {#type}

Yun theme supports two layout types via `themeConfig.type`:

- `nimbo` (default): Modern layout with top navigation bar + homepage banner animation + full-screen menu on mobile.
- `strato`: Classic layout with left sidebar + top navigation bar, similar to traditional blogs.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    type: 'nimbo', // or 'strato'
  },
})
```

::: tip
`strato` corresponds to the v1 layout style, `nimbo` to v2. Future layout variants will be named after different cloud types (e.g., cirro, cumulo, alto).
:::

## Colors {#colors}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    colors: {
      /**
       * Primary color
       * @default '#0078E7'
       */
      primary: '#0078E7',
    },
  },
})
```

## Navigation {#nav}

Top navigation bar items.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    nav: [
      { text: 'Posts', link: '/posts/', icon: 'i-ri-article-line' },
      { text: 'Links', link: '/links/', icon: 'i-ri-link' },
    ],
  },
})
```

Each `NavItem` has the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `text` | `string` | Display text (supports i18n key like `menu.posts`) |
| `link` | `string` | URL |
| `icon` | `string` | Icon name, see [Icônes](https://icones.js.org/) |
| `active` | `string` | Active route match pattern |

## Pages {#pages}

Page links displayed below the social links on the homepage sidebar.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    pages: [
      {
        name: 'Links',
        url: '/links/',
        icon: 'i-ri-link',
        color: 'dodgerblue',
      },
      {
        name: 'Projects',
        url: '/projects',
        icon: 'i-ri-gallery-view',
        color: 'var(--va-c-text)',
      },
    ],
  },
})
```

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Page name |
| `url` | `string` | Page URL |
| `icon` | `string` | Icon name, see [Icônes](https://icones.js.org/) |
| `color` | `string` | Legacy link color; used for the icon in mobile homepage navigation |
| `iconColor` | `string` | Independent icon color (CSS value). Overrides `color` without changing the label |

### Mobile homepage navigation {#home-navigation}

Choose a Nimbo mobile navigation style with `banner.navStyle`. The desktop arrangement stays the same.

| Value | Appearance |
| --- | --- |
| `plain` (default) | Colored icons and text with more open space |
| `glass` | Neutral glass capsules with subtle edge reflections |
| `panel` | All links grouped inside one frosted panel |
| `tiles` | A soft, matching color surface behind each icon |

Mobile links use two aligned columns with touch targets at least 48px high. The default `plain` style has a transparent background, subtle hover and press feedback, and a visible keyboard focus outline.

Set a different `iconColor` for each page while keeping mobile labels in the theme foreground color. The built-in Posts icon follows `colors.primary`.

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  banner: { navStyle: 'plain' },
  pages: [
    { name: 'Moments', url: '/moments/', icon: 'i-ri-chat-1-line', iconColor: '#009B81' },
    { name: 'Projects', url: '/projects', icon: 'i-ri-gallery-view', iconColor: '#C47B16' },
    { name: 'Albums', url: '/albums', icon: 'i-ri-image-line', iconColor: '#8863D7' },
  ],
})
```

Visit `/examples/navigation` in the Yun demo to compare all four styles, light and dark modes, and icon colors.

## Sidebar {#sidebar}

The `docs` layout renders this navigation on the left. You can provide one
sidebar for every document or use path prefixes to define multiple sidebars.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
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
          {
            text: 'Advanced',
            collapsed: true,
            items: [
              { text: 'Deployment', link: 'deployment' },
            ],
          },
        ],
      },
    },
  },
})
```

Set `layout: docs` in a page's frontmatter to use it. Groups become collapsible
when `collapsed` is present; `true` starts collapsed and `false` starts open.

## Footer {#footer}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    footer: {
      since: 2022,

      cloud: {
        enable: true, // Flowing cloud on top of footer
      },

      icon: {
        enable: true,
        name: 'i-ri-heart-fill',
        animated: true,
        color: 'red',
        url: '',
        title: '',
      },

      powered: true, // Show "Powered by Valaxy & valaxy-theme-yun"

      beian: {
        enable: false,
        icp: '', // e.g. '苏ICP备xxxxxxxx号'
        icpLink: 'https://beian.miit.gov.cn/',
        police: '', // Public security registration number
      },
    },
  },
})
```
