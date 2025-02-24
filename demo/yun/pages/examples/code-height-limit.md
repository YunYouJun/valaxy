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

::: code-group

```ts [site.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

import { addonComponents } from 'valaxy-addon-components'
import { addonLightGallery } from 'valaxy-addon-lightgallery'
import { addonTest } from 'valaxy-addon-test'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  devtools: true,
  // site config see site.config.ts or write in siteConfig
  // siteConfig: {},

  theme: 'yun',
  // see theme.config.ts or write in themeConfig
  // themeConfig in theme.config.ts

  build: {
    ssgForPagination: true,
  },

  unocss: {
    safelist,
  },

  markdown: {
    // default material-theme-palenight
    // theme: 'material-theme-palenight',
    theme: {
      // light: 'material-theme-lighter',
      light: 'github-light',
      // dark: 'material-theme-darker',
      dark: 'github-dark',
    },

    blocks: {
      tip: {
        icon: 'i-carbon-thumbs-up',
        text: 'ヒント',
        langs: {
          'zh-CN': '提示',
        },
      },
      warning: {
        icon: 'i-carbon-warning-alt',
        text: '注意',
      },
      danger: {
        icon: 'i-carbon-warning',
        text: '警告',
      },
      info: {
        text: 'información',
      },
    },

    codeTransformers: [
      // We use `[!!code` in demo to prevent transformation, here we revert it back.
      {
        postprocess(code) {
          return code.replace(/\[!!code/g, '[!code')
        },
      },
    ],
  },

  addons: [
    addonComponents(),

    addonLightGallery(),
    addonTest(),
  ],
})
```

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  // type: 'strato',
  type: 'nimbo',
  // colors: {
  //   primary: 'red',
  // },
  // bg_image: {},

  banner: {
    enable: true,
    title: '云游君的小站',
    siteNameClass: 'bg-gradient-to-r gradient-text from-#1e3c72 to-dark dark:from-#66a6ff dark:to-blue-500',
  },

  notice: {
    enable: true,
    content: '公告测试',
  },

  nav: [
    {
      text: '导航',
      link: '/projects',
      items: [
        { text: '项目列表', link: '/projects' },
        { text: '友情链接', link: '/links' },
        { text: '老婆列表', link: '/girls' },
        { text: '赞助者', link: 'https://sponsors.yunyoujun.cn' },
      ],
    },
  ],

  pages: [
    {
      name: '项目列表',
      url: '/projects',
      icon: 'i-ri-gallery-view',
      color: 'var(--va-c-text)',
    },
    {
      name: '相册',
      url: '/albums',
      icon: 'i-ri-image-line',
      color: 'var(--va-c-text)',
    },
    {
      name: '友情链接',
      url: '/links/',
      icon: 'i-ri-link',
      // color: 'dodgerblue',
    },
    {
      name: '老婆列表',
      url: '/girls/',
      icon: 'i-ri-women-line',
      // color: 'hotpink',
    },
    {
      name: '赞助者们',
      url: '/sponsors/',
      icon: 'i-ri-heart-line',
      color: 'red',
    },
  ],

  footer: {
    since: 2016,
    beian: {
      enable: true,
      icp: '苏ICP备17038157号',
    },
    icon: {
      animated: true,
    },
  },
})
```

:::
