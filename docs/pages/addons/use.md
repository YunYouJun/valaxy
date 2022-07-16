---
title: Use Addon
title_zh: 使用插件
categories:
  - Addon
---

## How To Use

```bash
pnpm add [valaxy-addon-package1] [valaxy-addon-package2]
# npm i [valaxy-addon-package1] [valaxy-addon-package2]
```

使用

```ts
// site.config.ts
import { defineSite } from 'valaxy'
export default defineSite({
  addons: [
    'valaxy-addon-package1',
    // pass addon options
    ['valaxy-addon-package2', { global: false }],
  ]
})
```
