---
title: Theme Yun Customization
categories:
  - theme
---

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
