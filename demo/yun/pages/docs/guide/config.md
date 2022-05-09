---
title: Config
title_zh: 配置
categories:
  - Docs
  - Guide
layout: docs
end: false
---

## 赞助

> 在每篇文章末尾，展示赞助（打赏）信息。

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
