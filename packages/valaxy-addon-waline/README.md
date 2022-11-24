# valaxy-addon-waline

valaxy-addon-waline 是基于 Waline 的一个 Valaxy 插件。

主题开发者可以通过将其作为依赖使用，以快速集成 Waline 评论组件。

## 如何集成

启用 `valaxy-addon-waline` 插件时，`<WalineClient />` 组件将会被自动注册。

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

启用 Waline 评论。

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline/node'

export default defineValaxyConfig({
  // 启用评论
  comment: {
    enable: true
  },
  // 设置 valaxy-addon-waline 配置项
  addons: [
    addonWaline({
      options: {
        serverURL: 'https://your-waline-url',
      }
    }),
  ],
})
```
