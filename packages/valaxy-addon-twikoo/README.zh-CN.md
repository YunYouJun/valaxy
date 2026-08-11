# valaxy-addon-twikoo

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-twikoo?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-twikoo)

[English](https://valaxy.site/addons/official/twikoo) | **简体中文**

为 Valaxy 站点与主题集成 [Twikoo](https://github.com/imaegoo/twikoo) 评论系统。

## 安装

```bash
pnpm add valaxy-addon-twikoo
```

## 站点配置

在 `valaxy.config.ts` 中启用评论并加载插件：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonTwikoo } from 'valaxy-addon-twikoo'

export default defineValaxyConfig({
  siteConfig: {
    comment: {
      enable: true,
    },
  },
  addons: [
    addonTwikoo(),
  ],
})
```

## 主题集成

> 如果使用的主题已经集成 Twikoo，可以跳过本节。

新建一个主题组件，例如 `YunTwikoo.vue`。可以参考 [`ValaxyMain.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/ValaxyMain.vue) 的集成方式。

```vue
<script lang="ts" setup>
import { useTwikooWithOptions } from 'valaxy-addon-twikoo'
import 'valaxy-addon-twikoo/client/styles/index.scss'

useTwikooWithOptions()
</script>

<template>
  <div id="tcomment" w="full" />
</template>
```
