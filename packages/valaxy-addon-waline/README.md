# valaxy-addon-waline

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-waline?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-waline)

valaxy-addon-waline 是基于 Waline 的一个 Valaxy 插件。

主题开发者可以通过将其作为依赖使用，以快速集成 Waline 评论组件。

> 除此之外，我们推荐您可以使用 [kotodama](https://github.com/YunYouJun/kotodama) 进行评论管理，它是一个基于 Waline 服务端实现的评论管理系统。

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
