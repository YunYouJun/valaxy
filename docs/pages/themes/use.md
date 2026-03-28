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

> [Theme Yun Config](/themes/yun)

```ts [valaxy.config.ts]
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'yun',
  themeConfig: {
    // ...
  }
})
```
