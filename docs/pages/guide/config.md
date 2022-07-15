---
title: Config
title_zh: 配置
categories:
  - Guide
end: false
---

## 赞助

> 在每篇文章末尾，展示赞助（打赏）信息。

```ts
// valaxy.config.ts
import { defineBlog } from 'valaxy'
export default defineBlog({
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
