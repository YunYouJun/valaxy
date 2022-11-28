---
title: Config
title_zh-CN: 配置
categories:
  - Guide
end: false
---

## 社交图标

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
// valaxy.config.ts
import { defineSite } from 'valaxy'
export default defineConfig({
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

## 赞助

> 在每篇文章末尾，展示赞助（打赏）信息。

```ts
// valaxy.config.ts
import { defineSite } from 'valaxy'
export default defineConfig({
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
