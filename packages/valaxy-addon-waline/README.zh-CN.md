# valaxy-addon-waline

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-waline?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-waline)

[English](https://valaxy.site/addons/official/waline) | **简体中文**

为 Valaxy 站点与主题集成 [Waline](https://waline.js.org/) 评论系统。

评论管理还可以使用 [Kotodama](https://github.com/YunYouJun/kotodama)，它是面向 Waline 服务端的评论管理界面。

## 安装

```bash
pnpm add valaxy-addon-waline
```

## 站点配置

在 `valaxy.config.ts` 中启用评论并加载插件：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  siteConfig: {
    comment: {
      enable: true,
    },
  },
  addons: [
    addonWaline({
      serverURL: 'https://your-waline-url',
    }),
  ],
})
```

## 主题集成

插件启用后会自动注册 `<WalineClient />` 组件：

```vue
<script lang="ts" setup>
import { useAddonWaline } from 'valaxy-addon-waline'

const addon = useAddonWaline()
</script>

<template>
  <WalineClient w="full" :options="addon.options" />
</template>
```

## FAQ

### `C()` is not defined

`@waline/client@3.4.2` 存在已知问题，请锁定到 `3.4.1`。
