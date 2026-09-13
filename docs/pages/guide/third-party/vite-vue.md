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
      VitePWA({
        workbox: {
          // SSG pages need their own HTML; disable the SPA fallback.
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

#### SSG navigation and offline behavior

Valaxy generates different HTML for each route. With the default `generateSW` strategy, `vite-plugin-pwa` sets `workbox.navigateFallback` to `'index.html'`. Navigation requests that do not match a precached page can therefore receive the homepage HTML, including direct visits and reloads of article URLs. Vue then hydrates that homepage DOM as an article, which can cause hydration mismatches, broken layouts, missing TOCs, or unresponsive links. See [#718](https://github.com/YunYouJun/valaxy/issues/718#issuecomment-5651201732).

Set `workbox.navigateFallback: null` as above so unmatched requests reach the server and receive their own SSG HTML. This also prevents navigation to files such as `/sitemap.xml` and `/atom.xml` from falling back to the homepage and showing the blog's 404 page. A `navigateFallbackDenylist` is unnecessary when the fallback is disabled; excluding only XML URLs while keeping the homepage fallback does not fix article hydration.

This setting does not disable PWA or precaching. Pages that are not cached still require a network connection; it does not automatically make every SSG page available offline. If you use `injectManifest` or custom navigation caching, ensure those handlers also return the requested page's HTML instead of the homepage. See the [Workbox navigation fallback options](https://developer.chrome.com/docs/workbox/modules/workbox-build#type-GeneratePartial).

#### Updating an existing deployment

After changing the configuration, rebuild and deploy the generated service worker along with the site. Existing visitors may still be controlled by the old worker until the new one activates. Complete your PWA's update flow, or close all tabs for the site and reopen it once the updated worker is installed.

To verify the fix, use a production build and preview (`pnpm build` then `pnpm serve`), wait until the new service worker controls the page, and directly open and reload an article URL. Check that the TOC and avatar navigation work, there are no hydration errors, and opening `/sitemap.xml` returns XML. In browser DevTools, temporarily bypassing the service worker helps distinguish a stale worker from a server configuration problem; development mode alone does not exercise the production worker.

#### Removing a previously deployed PWA

Deleting `VitePWA` from the configuration does not unregister service workers already installed in visitors' browsers. First add `selfDestroying: true` to your existing `VitePWA` options and deploy. Keep the other options, registration code, and worker filename/path unchanged so existing installations can fetch the replacement worker.

Keep serving that replacement worker for returning visitors before removing the integration; a single deployment does not guarantee every visitor has updated. See the [official service worker removal guide](https://vite-pwa-org.netlify.app/guide/unregister-service-worker).

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
