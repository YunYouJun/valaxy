# valaxy-addon-bangumi

[English](https://valaxy.site/addons/official/bangumi) | **简体中文**

通过 `ValaxyBangumi` 组件，在 Valaxy 中展示 Bilibili 与 Bangumi 追番列表。

插件依赖 [bilibili-bangumi-component](https://github.com/yixiaojiu/bilibili-bangumi-component)，并需要后端服务。请参考它的[后端部署文档](https://github.com/yixiaojiu/bilibili-bangumi-component/blob/main/docs/backend.md)完成部署。

## 安装

```bash
pnpm add valaxy-addon-bangumi
```

## 配置

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonBangumi } from 'valaxy-addon-bangumi'

export default defineValaxyConfig({
  addons: [
    addonBangumi({
      api: 'https://your-bangumi-api.example.com',
      bilibiliUid: '1579790',
      bgmEnabled: false,
    }),
  ],
})
```

在 Markdown 中使用自动注册的组件：

```md
---
title: Bangumi 追番列表
keywords: Bangumi
description: 我的 Bangumi 追番列表
---

<ValaxyBangumi />
```

## 样式覆盖

`bilibili-bangumi-component` 使用 Web Component 实现。由于 Shadow DOM 会隔离样式，需要通过插件选项传入 `customCss`：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonBangumi } from 'valaxy-addon-bangumi'

export default defineValaxyConfig({
  addons: [
    addonBangumi({
      customCss: '.bbc-bangumi-title a { color: red; }',
    }),
  ],
})
```

## API

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `api` | 后端 API 地址 | `string` | — |
| `bilibiliUid` | Bilibili UID；后端通过环境变量提供时可省略 | `string` | — |
| `bgmUid` | Bangumi UID；后端通过环境变量提供时可省略 | `string` | — |
| `bilibiliEnabled` | 是否展示 Bilibili 条目 | `boolean` | `true` |
| `bgmEnabled` | 是否展示 Bangumi 条目 | `boolean` | `true` |
| `pageSize` | 每页条目数量 | `number` | `15` |
| `customEnabled` | 是否启用自定义数据源 | `boolean` | `false` |
| `customLabel` | 自定义数据源的标签 | `string` | `'自定义'` |
| `customCss` | 注入 Web Component 的 CSS | `string` | — |
