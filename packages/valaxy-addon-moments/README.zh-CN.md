# valaxy-addon-moments

**简体中文** | [English](./README.md)

适用于 [Valaxy](https://valaxy.site) 的 Markdown 动态时间线插件。通过 `pages/moments` 目录发布短动态、照片和日常记录。

## 功能特性

- 使用 Markdown 编写动态，无需数据库。
- 支持日期、标题、地点、置顶优先级和最多九张图片。
- 支持按年、月浏览和渐进加载。
- 在生产构建中删除草稿路由。
- 隐藏动态不会出现在生产时间线中，但仍可通过链接直接访问。
- 提供适用于任意 Valaxy 主题的基础时间线。
- 可选的公共点赞数功能。

## 安装

```bash
pnpm add valaxy-addon-moments
```

在 `valaxy.config.ts` 中配置插件：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonMoments } from 'valaxy-addon-moments'

export default defineValaxyConfig({
  addons: [
    addonMoments({
      title: '小动态',
      description: '值得记录的日常',
    }),
  ],
})
```

启动或构建站点后，可通过 `/moments/` 访问动态页面，无需额外创建 `pages/moments/index.md`。

## 配置选项

所有选项均为可选：

| 选项               | 说明                                 | 默认值                |
| ------------------ | ------------------------------------ | --------------------- |
| `title`          | 页面标题                             | `Moments`           |
| `description`    | 页面描述                             | 无                    |
| `author.name`    | 动态卡片中显示的作者名称             | 站点作者名称          |
| `author.avatar`  | 动态卡片中显示的作者头像             | 站点作者头像          |
| `initialCount`   | 首次访问时显示的动态数量             | `10`                |
| `batchSize`      | 每次点击“加载更多”后增加的动态数量 | `10`                |
| `likes.enabled`  | 是否显示公共点赞按钮和点赞数         | `false`             |
| `likes.endpoint` | 点赞服务地址                         | `/api/moments-like` |

多语言站点可为 `title` 和 `description` 传入语言映射对象。

## 创建动态

Valaxy CLI 支持创建有标题或无标题的动态：

```bash
pnpm valaxy moments sunset
pnpm valaxy moments
```

第一条命令会创建 `pages/moments/YYYY-MM-DD-sunset.md`。第二条命令会创建 `pages/moments/YYYY-MM-DD-1.md`。目标文件已存在时，命令会自动递增编号且不会覆盖原文件。

编辑生成的文件，并在 Frontmatter 下方填写正文：

```md
---
date: 2026-08-13 18:30
location: 上海
images:
  - src: /images/moments/sunset.webp
    alt: 傍晚的天空
---

下班时遇到了很好看的晚霞。
```

也可以直接在 `pages/moments` 中创建 Markdown 文件。`date` 为必填字段。

### Frontmatter 字段

| 字段         | 说明                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| `date`     | 发布日期和时间，必填。                                                                     |
| `title`    | 显示在正文上方的可选标题。                                                                 |
| `location` | 显示在动态卡片中的地点。                                                                   |
| `images`   | 图片地址列表，或由`{ src, alt, width, height }` 组成的对象列表。最多显示前九张有效图片。 |
| `top`      | 置顶优先级，正数越大排序越靠前。                                                           |
| `draft`    | 设为`true` 时从生产构建中删除动态路由。                                                  |
| `hide`     | 设为任意真值时不显示在生产时间线中，直接访问链接仍然可用。                                 |

动态正文支持 Valaxy 的 Markdown 渲染和代码高亮。Vue 组件与加密内容不会在聚合动态卡片中渲染，此类内容应使用独立页面。

如需图片缩放，请启用 Valaxy 的 `siteConfig.mediumZoom`。

## 主题兼容性

基础动态列表可配合任意 Valaxy 主题使用。`valaxy-theme-yun` 会自动提供带侧边时间线导航的增强布局。其他主题可提供自定义的 `moments` 布局，或按需使用 `ValaxyMomentsTimeline` 组件。

## 自定义动态入口页

一般情况下，建议通过 `addonMoments()` 配置动态页面。如需添加自定义 Markdown 内容或页面级 Frontmatter，可创建 `pages/moments/index.md`：

```md
---
title: 动态
description: 值得记录的日常
moments:
  initialCount: 20
  batchSize: 10
---

动态页面介绍。
```

页面 Frontmatter 中 `moments` 下的选项会覆盖 `addonMoments()` 中的同名选项。

## 点赞功能

点赞功能默认关闭。部署兼容的点赞服务后，可通过以下配置启用：

```ts
addonMoments({
  likes: {
    enabled: true,
    endpoint: '/api/moments-like',
  },
})
```

可根据使用的托管平台和存储服务进行调整。不需要公共点赞数时，无需部署后端服务。此处展示使用 EdgeOne KV 存储的配置方法。

### EdgeOne KV 存储

如果您的 valaxy 项目托管在 EdgeOne 中，可以使用 EdgeOne Maker 中的 [KV 存储](https://console.cloud.tencent.com/edgeone/makers?tab=storage&sub=kv) 功能：

1. 创建 KV 命名空间（此处命名无限制）
2. 托管项目 - KV 存储 - KV 命名空间管理 - 绑定命名空间 - 变量名称填入 `moments_like`

仓库中的 [`demo/yun/edge-functions`](../../demo/yun/edge-functions) 提供了 EdgeOne KV 示例，将文件放入仓库，`addonMoments()` 中的 `likes.endpoint` 填入文件位置后即可使用点赞功能。

## License

MIT