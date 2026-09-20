---
title:
  zh-CN: 使用插件
  en: Use Addon
categories:
  - addon
---

## Manage addons in DevTools {#devtools}

Run `valaxy dev` and open **Addons** in Valaxy DevTools. The marketplace shares the documentation catalog and offers text/tag search, official/community filters, and npm, source and documentation links. **Installed** includes direct project dependencies and running theme addons, even when an addon has no DevTools panel.

Open an addon's details and review its exact version and command before confirming installation. Package operations use pnpm with lifecycle scripts disabled. Follow the addon documentation to configure its `addons` entry and required options, then restart the preview. Installing a package does not enable it automatically.

Removal previews dependency and configuration changes before updating the manifest and lockfile. Simple string/object entries and direct factory calls can be removed automatically. Dynamic configuration, references elsewhere in source files, and indirect theme dependencies require manual changes first. Article and media files are preserved. Progress, logs and errors stay visible; navigating between pages does not repeat an operation.

Projects using another package manager can browse the marketplace; continue managing their dependencies with that package manager in a terminal. Check each addon's scripts and peer dependency requirements before installation.

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
