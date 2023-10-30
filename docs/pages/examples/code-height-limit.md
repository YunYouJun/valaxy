---
title: Code height limit
title_zh-CN: 代码块高度限制
toc: true
categories:
  - examples
codeHeightLimit: 300
---

## Configure for single page

You can configure it in frontmatter. For example: 

```md
---
codeHeightLimit: 300
---
```

This is a code block that exceeds the height limit. 

```ts
import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-yun'

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

## Configure for the entire website

Add codeHeightLimit field in site.config.ts

For example:

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  // ignore other configuration
  codeHeightLimit: 300
})
```