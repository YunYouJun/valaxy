---
title: Use Addon
title_zh-CN: 使用插件
categories:
  - addon
---

## How To Use

```bash
pnpm add [valaxy-addon-package1] [valaxy-addon-package2]
# npm i [valaxy-addon-package1] [valaxy-addon-package2]
```

使用

```ts
// valaxy.config.ts
import { defineConfig } from 'valaxy'

export default defineConfig({
  addons: [
    'valaxy-addon-package1',
    // pass addon options
    ['valaxy-addon-package2', { global: false }],
  ]
})
```
