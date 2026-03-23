---
title: Use Vite/Vue Plugin
categories:
  - third
---

Valaxy is compatible with Vite/Vue plugins. You can refer to the following examples for usage.

## Using Vite Plugins

### Using vite-plugin-pwa

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { VitePWA } from 'vite-plugin-pwa'

export default defineValaxyConfig<ThemeConfig>({
  vite: {
    plugins: [
      // https://vite-pwa-org.netlify.app/
      VitePWA(),
    ],
  },
})
```

```ts [setup/main.ts]
import { defineAppSetup } from 'valaxy'

export default defineAppSetup(({ router, isClient }) => {
  router.isReady().then(async () => {
    if (!isClient)
      return
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({ immediate: true })
  })
})
```

For more configuration options, please refer to [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa).

## Using Vue Plugins

::: tip

Valaxy integrates [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) by default. If you need to customize the `@vitejs/plugin-vue` configuration, you can use the `vue` config option.

See [Extend Config](/guide/config/extend.md#vitejs-plugin-vue) for details.

:::

For example, to use Element Plus, you can add the following configuration in `setup/main.ts`:

```ts [setup/main.ts]
import ElementPlus from 'element-plus'

import { defineAppSetup } from 'valaxy'
import 'element-plus/lib/theme-chalk/index.css'

export default defineAppSetup(({ app }) => {
  app.use(ElementPlus)
})
```
