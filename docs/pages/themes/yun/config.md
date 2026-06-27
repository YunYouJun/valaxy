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
| `color` | `string` | Icon color (CSS value), default `var(--va-c-text)` |

## Sidebar {#sidebar}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    sidebar: {
      // sidebar config
    },
  },
})
```

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
