---
title: Use Vite/Vue Plugin 
title_zh-CN: 使用 Vite/Vue 插件
---

Valaxy 兼容 Vite/Vue 插件，你可以参考以下示例进行使用。

## 使用 Vite 插件

### 使用 vite-plugin-pwa

在 `vite.config.ts` 中添加以下配置：

```ts
import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-yun'
import { VitePWA } from 'vite-plugin-pwa'

export default defineValaxyConfig<ThemeConfig>({
  vite: {
    plugins: [
      VitePWA(),
      Inspect(),
    ],
  },
})
```

```ts
// setup/main.ts
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

如使用 Element Plus，你可以在 `setup/main.ts` 中添加以下配置：

```ts
import { defineAppSetup } from 'valaxy'

import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'

export default defineAppSetup(({ app }) => {
  app.use(ElementPlus)
})
```
