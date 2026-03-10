---
title: Use Theme
categories:
  - theme
top: 100
---

## Install Theme

```bash
npm i valaxy-theme-yun
# pnpm add valaxy-theme-yun
```

## Enable Theme


Configure the `theme` field as the theme name, such as `yun`.

```ts [valaxy.config.ts]
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'yun'
})
```

## Theme Config


Refer to the corresponding theme documentation, configure `themeConfig`.

> [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/docs/README.md)

```ts [valaxy.config.ts]
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'yun',
  themeConfig: {
    // ...
  }
})
```
