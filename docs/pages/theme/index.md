---
title: How to create a valaxy theme?
title_zh: 如何创建一个 Valaxy 主题
categories:
  - Theme
end: false
---

::: tip

Valaxy 与 Vite/Vue 的生态完全兼容，因此你可以像写一个 Vite 插件一样，在主题中自由地扩展。

- [Authoring a Plugin | Vite](https://vitejs.dev/guide/api-plugin.html#authoring-a-plugin)

:::

## APIs

我们提供了一个扩展函数，以供你快速扩展页面信息。

你也可以直接扩展 [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) 插件中的 `extendRoute`。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
export default defineConfig({
  valaxy: {
    pages: {
      extendRoute(route, parent) {
        console.log(route)
      },
    },
    extendMd(ctx) {
      console.log(ctx.path)
    },
  },
})
```

```ts
// provided by valaxy, just as a tip
export interface ValaxyPluginOptions {
  vue?: Parameters<typeof Vue>[0]
  components?: Parameters<typeof Components>[0]
  unocss?: UnoCSSConfig
  pages?: Parameters<typeof Pages>[0]
  extendMd?: (ctx: {
    route: any
    data: Record<string, any>
    excerpt?: string
    path: string
  }) => void
}
```

## ValaxyMain

你可以从 `ValaxyMain` 的 `props` 中获取 `frontmatter` 与 `pageData`。

## Third Plugin

- [关于评论](/docs/theme/comment)
