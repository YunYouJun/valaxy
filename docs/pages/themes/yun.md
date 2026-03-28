---
title: Theme Yun
categories:
  - theme
---

::: tip
Type definitions: [valaxy-theme-yun/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/types/index.d.ts)
:::

## Quick Start

```bash
pnpm add valaxy-theme-yun
```

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'yun',
  themeConfig: {
    // ...
  },
})
```

You can also extract the theme config into a separate `theme.config.ts` file:

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  // ...
})
```

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

## Banner {#banner}

The homepage banner with staggered text animation.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    banner: {
      enable: true,
      title: 'My Blog',
      // Split title manually
      // title: ['Hello', 'World'],
      // i18n support
      // title: { en: ['Hello', 'World'], 'zh-CN': '你好世界' },

      cloud: {
        enable: true, // Flowing cloud animation below banner
      },

      // Custom CSS class for site name
      siteNameClass: '',
      // Animation duration (nimbo only)
      duration: 500,
    },
  },
})
```

> To change the cloud color, override the CSS variable `--yun-c-cloud`:
>
> ```css
> :root {
>   --yun-c-cloud: red;
> }
> ```

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

## Background Image {#bg-image}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    bg_image: {
      enable: true,
      url: '/images/bg.jpg',
      dark: '/images/bg-dark.jpg', // Dark mode
      opacity: 1,
    },
  },
})
```

You can also override via CSS variables:

```css
:root {
  --yun-bg-img: url("/images/bg.jpg");
  --yun-sidebar-bg-img: url("/images/sidebar-bg.jpg");
}
```

## Notice {#notice}

Display an announcement banner.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    notice: {
      enable: true,
      hideInPages: false, // Whether to hide in /pages/[page]
      content: 'Welcome to my blog!',
    },
  },
})
```

## Say {#say}

Random quote/sentence display.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    say: {
      enable: true,
      api: '', // Custom API URL or local JSON path in public/
      hitokoto: {
        enable: true,
        api: 'https://v1.hitokoto.cn',
      },
    },
  },
})
```

## Fireworks {#fireworks}

Click fireworks effect powered by [@explosions/fireworks](https://www.npmjs.com/package/@explosions/fireworks).

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    fireworks: {
      enable: true,
      colors: ['#66A7DD', '#3E83E1', '#214EC2'],
    },
  },
})
```

## Post Card Types {#types}

Custom post type badges with icon and color.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    types: {
      link: {
        color: '#1890ff',
        icon: 'i-ri-link',
      },
      bilibili: {
        color: '#FF8EB3',
        icon: 'i-ri-bilibili-line',
      },
    },
  },
})
```

Then set `type` in post frontmatter:

```md
---
title: My Video
type: bilibili
url: https://www.bilibili.com/video/xxx
---
```

## Menu {#menu}

Custom navigation icon on the far right.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    menu: {
      custom: {
        title: 'Menu',
        url: '/',
        icon: 'i-ri-menu-line',
      },
    },
  },
})
```

## Edit Link {#edit-link}

Add an "Edit this page" link to posts.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/user/repo/edit/main/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
```

## Outline Title {#outline-title}

Table of contents heading text.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    /**
     * @default 'On this page'
     */
    outlineTitle: 'On this page',
  },
})
```

## Friend Links Page {#links}

Create `pages/links/index.md`:

```md
---
title: My Friends
links:
  - url: https://www.yunyoujun.cn
    avatar: https://www.yunyoujun.cn/images/avatar.jpg
    name: YunYouJun
    blog: YunYouJun's Blog
    desc: Hope to be an interesting person.
    color: "#0078e7"
# Or use a JSON URL
# links: https://friends.example.com/links.json
random: true
---

<YunLinks :links="frontmatter.links" :random="frontmatter.random" />
```

## Styles {#styles}

Override theme styles by creating `styles/index.ts`:

```ts [styles/index.ts]
import './vars.scss'
```

```scss [styles/vars.scss]
:root {
  --yun-bg-img: url("https://example.com/bg.jpg");
  --yun-sidebar-bg-img: url("https://example.com/sidebar.jpg");
  --yun-c-cloud: pink;
}
```
