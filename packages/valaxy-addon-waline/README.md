# valaxy-addon-waline

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-waline?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-waline)

valaxy-addon-waline 是基于 Waline 的一个 Valaxy 插件。

主题开发者可以通过将其作为依赖使用，以快速集成 Waline 评论组件。

## 如何集成

```bash
npm i valaxy-addon-waline
```

### 主题使用者

用户启用 Waline 评论。

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  // or write it in site.config.ts
  siteConfig: {
    // 启用评论
    comment: {
      enable: true
    },
  },
  // 设置 valaxy-addon-waline 配置项
  addons: [
    addonWaline({
      serverURL: 'https://your-waline-url',
    }),
  ],
})
```

### 主题开发者

当用户启用 `valaxy-addon-waline` 插件时，`<WalineClient />` 组件将会被自动注册。

```vue
<!-- YunWaline -->
<script lang="ts" setup>
import { useAddonWaline } from 'valaxy-addon-waline'

const addon = useAddonWaline()
</script>

<template>
  <WalineClient w="full" :options="addon.options" />
</template>
```

## FAQ

### 为什么开发阶段第一次启动后进入文章页面会重新刷新？

在进入带有评论的文章页面后，Vite 按需加载发现了 `@waline/client/component` 组件，此时将其加入至 `optimizeDeps` 中。
这减少了初次启动的时间。

如果你希望初次进入后，即不再动态加载 `@waline/client/component`，可预先将其加入至 `optimizeDeps` 中。

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@waline/client/component'],
  },
})
```
