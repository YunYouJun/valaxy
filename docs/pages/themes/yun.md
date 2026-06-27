---
title: Theme Yun
categories:
  - theme
---

::: tip
Type definitions: [valaxy-theme-yun/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/types/index.d.ts)
:::

`valaxy-theme-yun` is the default blog theme for Valaxy. It focuses on personal blogs, post archives, friend links, animated home banners, and theme-level customization.

## Quick Start {#quick-start}

```bash
pnpm add valaxy-theme-yun
```

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'yun',
  themeConfig: {
    type: 'nimbo',
  },
})
```

You can also extract the theme config into a separate `theme.config.ts` file:

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  type: 'nimbo',
})
```

## Documentation Map {#documentation-map}

- [Config Reference](/themes/yun/config): theme type, colors, navigation, pages, sidebar, and footer.
- [Layout And Visuals](/themes/yun/layout): banner, background image, and layout-related options.
- [Widgets And Pages](/themes/yun/widgets): notice, say, fireworks, post card types, menu, and friend links.
- [Customization](/themes/yun/customization): edit links, outline title, and style overrides.
