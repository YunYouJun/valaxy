---
title: Config
title_zh-CN: 配置
categories:
  - Config
end: false
top: 10
---

## 配置说明

为了便于配置，Valaxy 将配置分为了三种。

`valaxy.config.ts` 是配置的主入口，。

- `siteConfig`: 站点**信息**配置，这部分内容面向站点展示且在任何主题也是通用的格式
- `themeConfig`: 主题配置，这部分内容仅在特定主题生效
- `runtimeConfig`: 运行时的配置（由 Valaxy 自动生成），用户无需配置
- 其他 Valaxy 通用配置内容（如需要在 Node 端处理的配置）

譬如：

```ts
// valaxy.config.ts
import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-yun'
import { addonComponents } from 'valaxy-addon-components'
import Inspect from 'vite-plugin-inspect'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts or write in siteConfig
  siteConfig: {},

  theme: 'yun',
  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },

  vite: {
    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    plugins: [Inspect()],
  },

  unocss: {
    safelist,
  },

  addons: [
    addonComponents()
  ],
})
```

## Site Config

站点**信息**配置，这部分内容面向站点展示且在任何主题也是通用的格式。

你也可以将其写在 `site.config.ts` 中。

譬如：

```ts
// site.config.ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'zh-CN',
  title: 'Valaxy Theme Yun',
  url: 'https://valaxy.yyj.moe/',
  author: {
    avatar: 'https://www.yunyoujun.cn/images/avatar.jpg',
    name: '云游君',
  },
  description: 'Valaxy Theme Yun Preview.',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    }
  ],

  sponsor: {
    enable: true,
    methods: [
      {
        name: '支付宝',
        url: 'https://cdn.yunyoujun.cn/img/donate/alipay-qrcode.jpg',
        color: '#00A3EE',
        icon: 'i-ri-alipay-line',
      },
    ],
  },
})
```

### 社交图标

```ts
export interface SocialLink {
  /**
   * The title of your link
   */
  name: string
  link: string
  /**
   * 图标名称
   * https://icones.js.org/
   */
  icon: string
  color: string
}
```

示例：

```ts
// site.config.ts
import { defineSiteConfig } from 'valaxy'
export default defineSiteConfig({
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'QQ 群 1050458482',
      link: 'https://qm.qq.com/cgi-bin/qm/qr?k=kZJzggTTCf4SpvEQ8lXWoi5ZjhAx0ILZ&jump_from=webapi',
      icon: 'i-ri-qq-line',
      color: '#12B7F5',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/YunYouJun',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
  ]
})
```

### 赞助

> 在每篇文章末尾，展示赞助（打赏）信息。

```ts
// site.config.ts
import { defineSiteConfig } from 'valaxy'
export default defineSiteConfig({
  sponsor: {
    enable: true,
    methods: [
      {
        name: '支付宝',
        url: 'https://cdn.yunyoujun.cn/img/donate/alipay-qrcode.jpg',
        color: '#00A3EE',
        icon: 'i-ri-alipay-line',
      },
      {
        name: '微信支付',
        url: 'https://cdn.yunyoujun.cn/img/donate/wechatpay-qrcode.jpg',
        color: '#2DC100',
        icon: 'i-ri-wechat-pay-line',
      },
    ],
  },
})
```

你可以通过 `sponsor` 属性控制全局是否开启。

```ts
interface SponsorOption {
  enable: boolean
  title: string
  methods: {
    name: string
    url: string
    color: string
    icon: string
  }[]
}
```

或为某篇文章的 Front Matter 单独设置：

```md
---
title: xxx
sponsor: false
---
```

## Theme Config

参照 [使用主题](/themes/use) 及您所使用的主题文档进行配置。
