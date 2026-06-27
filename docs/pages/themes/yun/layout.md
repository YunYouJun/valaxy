---
title: Theme Yun Layout And Visuals
categories:
  - theme
---

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

To change the cloud color, override the CSS variable `--yun-c-cloud`:

```css
:root {
  --yun-c-cloud: red;
}
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
