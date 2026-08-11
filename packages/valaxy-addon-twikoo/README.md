# valaxy-addon-twikoo

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-twikoo?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-twikoo)

**English** | [简体中文](https://valaxy.site/zh/addons/official/twikoo)

Integrate the [Twikoo](https://github.com/imaegoo/twikoo) comment system with Valaxy sites and themes.

## Installation

```bash
pnpm add valaxy-addon-twikoo
```

## Site configuration

Enable comments and load the addon in `valaxy.config.ts`:

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

## Theme integration

> Skip this section when you use a theme that already integrates Twikoo.

Create a theme component such as `YunTwikoo.vue`. See [`ValaxyMain.vue`](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/ValaxyMain.vue) for an integration example.

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
