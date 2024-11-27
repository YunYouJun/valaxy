---
title: Extend Config
title_zh: 扩展配置
categories:
  - config
---

以下是所有的扩展配置项与相关类型。

> [packages/valaxy/node/type.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/node/types.ts)

::: details package/valaxy/node/types.ts ValaxyExtendConfig

<<< @/../packages/valaxy/node/types.ts#snippet{ts:line-numbers}

:::

::: zh-CN
所以，你可以像这样使用：
:::

::: en
So you can use it like this:
:::

```ts
import type { ThemeConfig } from 'valaxy-theme-yun'
// valaxy.config.ts
import { defineValaxyConfig } from 'valaxy'
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
