---
title:
  zh-CN: 使用插件
  en: Use Addon
categories:
  - addon
---

## How To Use

```bash
pnpm add [valaxy-addon-package1] [valaxy-addon-package2]
# npm i [valaxy-addon-package1] [valaxy-addon-package2]
```

使用

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonTest } from 'valaxy-addon-test'

export default defineValaxyConfig({
  addons: [
    // we always recommend to use function, so that you can pass options
    addonTest(),

    'valaxy-addon-package1',
    // pass addon options
    ['valaxy-addon-package2', { global: false }],
  ]
})
```

### Addon With Options

譬如开启 Waline 评论：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'

export default defineValaxyConfig({
  // 启用评论
  comment: {
    enable: true
  },
  // 设置 valaxy-addon-waline 配置项
  addons: [
    addonWaline({
      serverURL: 'https://your-waline-url',
    }),
  ],
})
```
