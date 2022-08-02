---
title: How to create a theme?
title_zh: 如何创建一个 Valaxy 主题
categories:
  - Theme
end: false
top: 50
---

::: tip

Valaxy 与 Vite/Vue 的生态完全兼容，因此你在编写主题时，可以任意使用第三方的 Vite/Vue 插件。

- [Authoring a Plugin | Vite](https://vitejs.dev/guide/api-plugin.html#authoring-a-plugin)
- [Writing a Plugin | Vue](https://vuejs.org/guide/reusability/plugins.html#writing-a-plugin)

:::

撰写中...

## APIs

我们提供了一个扩展函数，以供你快速扩展页面信息。

你也可以直接扩展 [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) 插件中的 `extendRoute`。

```ts
// valaxy.config.ts
import { defineTheme } from 'valaxy'
export default defineTheme({
  pages: {
    extendRoute(route, parent) {
      console.log(route)
    },
  },
  extendMd(ctx) {
    console.log(ctx.path)
  },
})
```

```ts
// provided by valaxy, just as a tip
export interface ValaxyConfig {
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

### 实现评论

作为博客，用户通常会有评论的需求。

而由于评论系统各不相同，如 Hexo 等主题开发者们通常需在主题侧重复实现多款评论系统。
这显然是繁琐的。

Valaxy 决定通过插件中心化地提供各类封装好的评论钩子函数。

譬如主题开发者，可以从 `valaxy-addon-waline` 中导入 `useWaline` 来快速实现 [Waline](https://waline.js.org/) 评论系统的集成。  
而用户则可以使用相同的配置穿梭漫游于不同的主题之间。

```vue {2}
<script lang="ts" setup>
import { useConfig, useWaline } from 'valaxy-addon-waline'

// 读取用户配置
const config = useConfig()
// 挂载 Waline
useWaline(config.value.comment.waline)
</script>

<template>
  <!-- waline html 挂载点，将其写入布局中 -->
  <div id="waline" w="full" />
</template>

<style lang="scss">
// 可以在此处覆盖 waline 样式
#waline {
  --waline-theme-color: var(--va-c-primary);
}
</style>
```
