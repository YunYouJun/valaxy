---
title: Extend Config
title_zh-CN: 扩展配置
categories:
  - config
---

以下是所有的扩展配置项与相关类型。

> [packages/valaxy/node/type.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/node/types.ts)

```ts
// types
export interface ValaxyExtendConfig {
  /**
   * Markdown Feature
   */
  features: {
    /**
     * enable katex for global
     */
    katex: boolean
  }

  vite?: ViteUserConfig
  vue?: Parameters<typeof Vue>[0]
  components?: Parameters<typeof Components>[0]
  unocss?: UnoCSSConfig
  /**
   * unocss presets
   */
  unocssPresets?: {
    uno?: Parameters<typeof presetUno>[0]
    attributify?: Parameters<typeof presetAttributify>[0]
    icons?: Parameters<typeof presetIcons>[0]
    typography?: Parameters<typeof presetTypography>[0]
  }
  pages?: Parameters<typeof Pages>[0]
  /**
   * for markdown
   */
  markdown?: MarkdownOptions
  extendMd?: (ctx: {
    route: {
      meta: { frontmatter: Record<string, any>, layout?: string } & object
      path: string
      component: string
    }
    data: Readonly<Record<string, any>>
    content: string
    excerpt?: string
    path: string
  }) => void
  addons?: ValaxyAddons
}
```

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

### Unocss Presets

我们默认集成了 [UnoCSS](https://unocss.dev) 及以下预设。

- [`presetUno`](https://unocss.dev/presets/attributify): 一些常用按需生成的样式，类 TailwindCSS。
- [`presetAttributify`](https://unocss.dev/presets/attributify): 使用属性选择器替代类名。
- [`presetIcons`](https://unocss.dev/presets/icons): 集成了 [icones](https://icones.netlify.app/) 图标库，按需使用。
- [`presetTypography`](https://unocss.dev/presets/typography)

因此，你可以直接在 Markdown 中快速实现各式各样的效果。

见 [UnoCSS | Markdown](/guide/markdown#unocss)。
