---
title: Code height limit
toc: true
categories:
  - examples
codeHeightLimit: 300
---


Set `codeHeightLimit: 300` in Front Matter.

```md [pages/code-height-limit.md]
---
codeHeightLimit: 300
---
```


Rendering result

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts or write in siteConfig
  // siteConfig: {},

  theme: 'yun',
  themeConfig: {

    banner: {
      enable: true,
      title: '云游君的小站',
    },

    notice: {
      enable: true,
      content: '公告测试',
    },
  },

  unocss: {
    safelist,
  },
})
```
