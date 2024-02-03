---
title: Extend Config
title_zh-CN: 扩展配置
categories:
  - config
---

以下是所有的扩展配置项与相关类型。

> [packages/valaxy/node/type.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/node/types.ts)

<<< @/../packages/valaxy/node/types.ts

::: zh-CN
所以，你可以像这样使用：
:::

::: en
So you can use it like this:
:::

```ts
// valaxy.config.ts
import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-yun'
import { addonComponents } from 'valaxy-addon-components'
import { VitePWA } from 'vite-plugin-pwa'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts or write in siteConfig
  siteConfig: {},

  theme: 'yun',
  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },

  vite: {
    // https://vite-pwa-org.netlify.app/
    plugins: [VitePWA()],
  },

  unocss: {
    safelist,
  },

  addons: [
    addonComponents()
  ],
})
```

### @vitejs/plugin-vue

Valaxy 默认集成了 [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) 插件，你可以通过 `vue` 配置项进行配置。

```ts
// valaxy.config.ts
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('my-')
      }
    }
  }
})
```

### Unocss Presets

我们默认集成了 [UnoCSS](https://unocss.dev) 及以下预设。

- [`presetUno`](https://unocss.dev/presets/attributify): 一些常用按需生成的样式，类 TailwindCSS。
- [`presetAttributify`](https://unocss.dev/presets/attributify): 使用属性选择器替代类名。
- [`presetIcons`](https://unocss.dev/presets/icons): 集成了 [icones](https://icones.netlify.app/) 图标库，按需使用。
- [`presetTypography`](https://unocss.dev/presets/typography)

因此，你可以直接在 Markdown 中快速实现各式各样的效果。

见 [UnoCSS | Markdown](/guide/markdown#unocss)。
