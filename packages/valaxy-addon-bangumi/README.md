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

| 字段           | 描述                                                 | 类型    | 默认值 |
|:--------------:|:----------------------------------------------------:|:------:|:------:|
| api                | 后端 api 地址                                     |  string | - |
| bilibiliUid       | Bilibili 的 uid，在后端中引入 uid 的 env 后可以不设置 |  string | - |
| bgmUid            | Bangumi 的 uid，在后端中引入 uid 的 env 后可以不设置  |  string | - |
| bilibiliEnabled   | 是否展示 Bilibili                                 |  boolean | true |
| bgmEnabled        | 是否展示 Bangumi                                  |  boolean | true |
| pageSize          | 分页大小                                          |  number | 15 |
| customEnabled     | 是否启用自定义数据源                                |  boolean | false |
| customLabel       | 自定义数据源的展示标签名                             |  string | "'自定义'" |
| customCss          | 自定义 css                                        | string | - |
