# valaxy-addon-waline

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-waline?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-waline)

**English** | [简体中文](https://valaxy.site/zh/addons/official/waline)

Integrate the [Waline](https://waline.js.org/) comment system with Valaxy sites and themes.

For comment administration, you can also use [Kotodama](https://github.com/YunYouJun/kotodama), a management interface built for Waline servers.

## Installation

```bash
pnpm add valaxy-addon-waline
```

## Site configuration

Enable comments and load the addon in `valaxy.config.ts`:

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

## Theme integration

When the addon is enabled, it registers the `<WalineClient />` component automatically:

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

`@waline/client@3.4.2` has a known issue. Pin it to `3.4.1`.
