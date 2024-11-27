---
title: Code height limit
title_zh: 代码块高度限制
toc: true
categories:
  - examples
codeHeightLimit: 300
---

::: zh-CN
在 Front Matter 中设置 `codeHeightLimit: 300`。
:::

::: en
Set `codeHeightLimit: 300` in Front Matter.
:::

```md
---
codeHeightLimit: 300
---
```

::: zh-CN
渲染结果
:::

::: en
Rendering result
:::

```ts
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
