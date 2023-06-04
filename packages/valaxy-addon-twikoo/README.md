# valaxy-addon-twikoo

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-twikoo?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-twikoo)

valaxy-addon-twikoo 是基于 [Twikoo](https://github.com/imaegoo/twikoo) 的一个 Valaxy 插件。

主题开发者可以通过将其作为依赖使用，以快速集成 Twikoo 评论组件。

## Usage

```bash
npm i valaxy-addon-twikoo
```

### 主题使用者

用户启用 Twikoo评论。

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonTwikoo } from 'valaxy-addon-twikoo'

export default defineValaxyConfig({
  // 启用评论
  comment: {
    enable: true
  },
  // 设置 valaxy-addon-twikoo 配置项
  addons: [
    addonTwikoo({ }),
  ],
})
```

### 主题开发者

> 如果您只是使用者而非开发者，可以忽略该部分内容。

新建 `YunTwikoo.vue`，并参考 [valaxy-theme-yun/components/ValaxyMain.vue](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/components/ValaxyMain.vue) 进行主题集成适配。

```vue
<!-- YunTwikoo.vue -->
<script lang="ts" setup>
import { useTwikooWithOptions } from 'valaxy-addon-twikoo'

// twikoo loading style patch
import 'valaxy-addon-twikoo/client/styles/index.scss'

useTwikooWithOptions()
</script>

<template>
  <div id="tcomment" w="full" />
</template>

<style lang="scss">
// custom twikoo style
</style>
```

#### External for On Demand

主题不依赖于 `valaxy-addon-twikoo` 的同时，对用户自行安装的 `valaxy-addon-twikoo` 进行适配，需要在 `valaxy.config.ts` 中配置 `external`。

```ts
// valaxy.config.ts
export default defineValaxyTheme<ThemeConfig>((options) => {
  return {
    vite: {
      build: {
        rollupOptions: {
          // add on demand external
          external: [
            // adapt for twikoo
            'valaxy-addon-twikoo',
            'valaxy-addon-twikoo/client/styles/index.scss',
          ],
        },
      },
    },
  }
})
```
