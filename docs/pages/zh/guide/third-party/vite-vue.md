---
title: 使用 Vite/Vue 插件
categories:
  - third
---

Valaxy 兼容 Vite/Vue 插件，你可以参考以下示例进行使用。

## 使用 Vite 插件 {#使用-vite-插件}

### 使用 vite-plugin-pwa {#使用-vite-plugin-pwa}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { VitePWA } from 'vite-plugin-pwa'

export default defineValaxyConfig<ThemeConfig>({
  vite: {
    plugins: [
      // https://vite-pwa-org.netlify.app/
      VitePWA({
        workbox: {
          // SSG 页面需要各自的 HTML，禁用 SPA 首页回退。
          navigateFallback: null,
        },
      }),
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

#### SSG 导航与离线行为

Valaxy 为每个路由生成不同的 HTML。在默认的 `generateSW` 策略下，`vite-plugin-pwa` 将 `workbox.navigateFallback` 设为 `'index.html'`。未匹配到预缓存页面的导航请求可能因此收到首页 HTML，包括直接访问或刷新文章链接。Vue 随后会按文章页对首页 DOM 进行 hydration，造成 hydration mismatch、布局错位、目录缺失或链接无法点击。参见 [#718](https://github.com/YunYouJun/valaxy/issues/718#issuecomment-5651201732)。

按上面的示例设置 `workbox.navigateFallback: null`，让未匹配的请求交给服务器，返回对应的 SSG HTML。这也能避免直接访问 `/sitemap.xml`、`/atom.xml` 等文件时回退到首页，进而显示博客的 404 页面。禁用回退后，无需再设置 `navigateFallbackDenylist`；只排除 XML 地址而保留首页回退，不能修复文章页的 hydration 问题。

此配置不会禁用 PWA 或预缓存，但未缓存的页面仍需要网络连接，并不会自动让所有 SSG 页面支持离线访问。如果使用 `injectManifest` 或自定义导航缓存，也应确保返回请求页面自身的 HTML，而非首页。参见 [Workbox 导航回退配置](https://developer.chrome.com/docs/workbox/modules/workbox-build#type-GeneratePartial)。

#### 更新已有部署

修改配置后，重新构建并将生成的 Service Worker 与站点一起部署。新 Worker 激活前，已有访客仍可能受旧 Worker 控制。请完成站点的 PWA 更新流程，或在新 Worker 安装后关闭该站点的所有标签页并重新打开。

验证时，使用生产构建及预览（先 `pnpm build`，再 `pnpm serve`），等待新 Service Worker 接管页面，然后直接打开并刷新文章链接。确认目录、头像跳转正常，控制台没有 hydration 错误，且直接访问 `/sitemap.xml` 返回 XML。可在浏览器开发者工具中临时绕过 Service Worker，区分旧 Worker 与服务器配置问题；仅使用开发模式无法验证生产 Worker 的行为。

#### 移除已经部署的 PWA

直接从配置中删除 `VitePWA`，不会注销访客浏览器里已安装的 Service Worker。应先在现有 `VitePWA` 配置中加入 `selfDestroying: true` 并部署，保留其他选项、注册代码及 Worker 文件名和路径，让已有安装能够获取替代 Worker。

移除集成前，应持续提供这个替代 Worker，以覆盖之后才再次访问的用户；发布一次并不代表所有访客都已更新。参见 [官方 Service Worker 注销指南](https://vite-pwa-org.netlify.app/guide/unregister-service-worker)。

更多配置请参考 [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)。

## 使用 Vue 插件 {#使用-vue-插件}

::: tip

Valaxy 默认集成了 [`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) 插件，如果你自定义插件 `@vitejs/plugin-vue` 的配置，你可以通过 `vue` 配置项进行配置。

可参见 [扩展配置](/zh/guide/config/extend.md#vitejs-plugin-vue)。

:::

譬如使用 Element Plus，你可以在 `setup/main.ts` 中添加以下配置：

```ts [setup/main.ts]
import ElementPlus from 'element-plus'

import { defineAppSetup } from 'valaxy'
import 'element-plus/lib/theme-chalk/index.css'

export default defineAppSetup(({ app }) => {
  app.use(ElementPlus)
})
```

