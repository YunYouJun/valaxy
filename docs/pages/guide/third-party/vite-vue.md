---
title: Use Vite/Vue Plugin
title_zh: 使用 Vite/Vue 插件
categories:
  - third
---

Valaxy 兼容 Vite/Vue 插件，你可以参考以下示例进行使用。

## 使用 Vite 插件

### 使用 vite-plugin-pwa

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

更多配置请参考 [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)。

## 使用 Vue 插件

::: tip

Valaxy 默认集成了 [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) 插件，如果你自定义插件 `@vitejs/plugin-vue` 的配置，你可以通过 `vue` 配置项进行配置。

可参见 [扩展配置](/guide/config/extend.md#vitejs-plugin-vue)。

:::

譬如使用 Element Plus，你可以在 `setup/main.ts` 中添加以下配置：

```ts
import ElementPlus from 'element-plus'

import { defineAppSetup } from 'valaxy'
import 'element-plus/lib/theme-chalk/index.css'

export default defineAppSetup(({ app }) => {
  app.use(ElementPlus)
})
```
