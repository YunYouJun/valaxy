# valaxy-addon-moments

**简体中文** | [English](./README.md)

一个与主题解耦的 [Valaxy](https://valaxy.site) Markdown 小动态时间线插件。

## 功能

- 通过 `pages/moments/*.md` 发布动态，无需数据库。
- 支持作者、日期、标题、位置、置顶、长内容展开和最多九张图片。
- 按年月分组，支持渐进渲染与时间线导航。
- 在生成生产路由前删除草稿和隐藏动态。
- 使用站点配置的时区；未配置时固定使用 UTC，避免 SSG 与 hydration 结果不一致。
- 聚合正文使用 Valaxy 配置的 Markdown-it 渲染器及代码高亮。
- 可通过自定义 HTTP 接口读取公共点赞数，`localStorage` 只保存当前浏览器是否点过赞。

时间线通过 HTML 展示站点作者可信的 Markdown。依赖 Vue SFC 编译的自定义组件、加密内容等能力应放在普通独立页面中。

## 主题兼容性

插件负责动态发现、渲染、样式和默认 `/moments/` 页面，因此基础列表可用于任意 Valaxy 主题。`valaxy-theme-yun` 会自动提供带侧边时间线的增强 `moments` 布局；其他主题可以提供自己的布局，并按设计需要放置 `ValaxyMomentsTimeline`。

## 安装

```bash
pnpm add valaxy-addon-moments
```

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonMoments } from 'valaxy-addon-moments'

export default defineValaxyConfig({
  addons: [
    addonMoments({
      title: '小随想',
      description: '记录生活里的小事',
      initialCount: 10,
      batchSize: 10,
      likes: {
        enabled: true,
        endpoint: '/api/moments-like',
      },
    }),
  ],
})
```

插件会自动提供 `/moments/`，推荐直接在 `addonMoments()` 中完成设置。普通站点不需要创建 `pages/moments/index.md`。

站点仍可用 `pages/moments/index.md` 覆盖默认入口，适合需要编写入口页 Markdown 或单独设置 Frontmatter 的情况。页面中填写的 `moments` 选项优先于 `addonMoments()` 中的同名选项。

```md
---
title: 小随想
description: 记录生活里的小事
moments:
  initialCount: 10
  batchSize: 10
  likes:
    enabled: true
    endpoint: /api/moments-like
---
```

由于插件本身已经提供同一路由，当前路由扫描器可能在构建时显示同路由提示。用户目录中的入口页仍会按 Valaxy 的文件优先级生效。没有自定义入口内容时，直接使用 `addonMoments()` 配置即可。

点赞默认关闭。启用后，插件会批量读取公共点赞数，并在点击时乐观更新按钮。接口请求失败会回滚界面，只有请求成功后才会保存当前浏览器的点赞状态。

### 点赞接口契约

点赞接口不绑定托管平台。成功响应必须返回 2xx 状态码，并提供符合以下契约的 JSON 响应体。

`GET /api/moments-like?ids=id1,id2` 返回从每个请求 moment ID 到公共点赞数的映射：

```json
{
  "id1": 12,
  "id2": 5
}
```

如果 GET 返回了合法映射，但某个值缺失或无效，客户端会将该项显示为 `0`。有限计数会向下取整，负数会限制为 `0`。

`POST /api/moments-like` 接收以下两种 JSON 请求体之一：

```json
{ "momentId": "id1", "action": "like" }
```

```json
{ "momentId": "id1", "action": "unlike" }
```

接口返回更新后的公共点赞数：

```json
{ "count": 13 }
```

POST 响应中的 `count` 必须是可转换为有限数字的值。`count` 缺失或无效、JSON 响应体为空或格式错误（包括 `204` 响应），以及任何非 2xx 状态都会被视为请求失败。客户端会回滚乐观更新，并且不会修改 `localStorage`。GET 请求失败不会影响 moments 页面，也不会替换当前计数。

仓库在 [`demo/yun/edge-functions`](../../demo/yun/edge-functions) 中提供了 EdgeOne KV 示例，其他平台可以使用自己的函数和存储实现相同接口。这个轻量方案不包含用户身份、防刷或严格事务计数。

## 编写动态

新建 `pages/moments/2026-08-13-sunset.md`：

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

`date` 为必填项。`top` 数值越大越靠前。生产构建会从生成路由树中删除 `draft: true` 或任意真值 `hide` 的动态。

图片既可写字符串，也可写 `{ src, alt, width, height }` 对象，只展示前九张有效图片。图片缩放需要启用 Valaxy 的 `siteConfig.mediumZoom`；渐进加载出的卡片会在挂载时自动绑定缩放。

## 开发验证

```bash
pnpm --filter valaxy-addon-moments test
pnpm lint
pnpm typecheck
```

## License

MIT
