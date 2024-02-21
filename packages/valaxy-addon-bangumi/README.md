# valaxy-addon-bangumi

关联 issue [[功能建议] 追番列表](https://github.com/YunYouJun/valaxy/issues/296)

依赖 [bilibili-bangumi-component](https://github.com/yixiaojiu/bilibili-bangumi-component)，需要部署后端服务，可参考 [bilibili-bangumi 使用](https://github.com/yixiaojiu/bilibili-bangumi-component?tab=readme-ov-file#%E4%BD%BF%E7%94%A8)进行搭建

## 如何集成

```bash
npm i valaxy-addon-bangumi
```

`valaxy-addon-bangumi` 暴露了 `ValaxyBangumi` 组件

使用示例：

```ts
// valaxy.config.ts
import { defineConfig } from 'valaxy'
import { addonBangumi } from 'valaxy-addon-bangumi'

export default defineConfig({
  addons: [
    addonBangumi({
      api: 'https://yi_xiao_jiu-bangumi.web.val.run',
      bilibiliUid: '1579790',
      bgmEnabled: false,
    }),
  ]
})
```

```md
---
title: Bangumi 追番列表
keywords: Bangumi
description: Bangumi 追番列表
---

<ValaxyBangumi />
```

## 样式覆盖

bilibili-bangumi-component 使用 WebComponent 实现，而 Shadow DOM 具有隔离性，外部样式样式无法覆盖内部样式，可以通过下面的方式覆盖：

```ts
// valaxy.config.ts
import { defineConfig } from 'valaxy'
import { addonBangumi } from 'valaxy-addon-bangumi'

export default defineConfig({
  addons: [
    addonBangumi({
      customCss: '.bbc-bangumi-title a { color: red; }'
    }),
  ]
})
```

## API

| 字段           | 描述                                     | 默认值 |
|:--------------:|:----------------------------------------:|:------:|
| api                | 后端 api 地址                                     | - |
| bilibili-uid       | Bilibili 的 uid，在后端中引入 uid 的 env 后可以不设置 | - |
| bgm-uid            | Bangumi 的 uid，在后端中引入 uid 的 env 后可以不设置  | - |
| bilibili-enabled   | 是否展示 Bilibili 平台                             | true |
| bgm-enabled        | 是否展示 Bangumi 平台                              | true|
| customCss          | 自定义 css                                        | - |
