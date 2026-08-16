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
    }),
  ],
})
```

插件会自动提供 `/moments/`。站点也可以用 `pages/moments/index.md` 覆盖入口：

```md
---
title: 小随想
description: 记录生活里的小事
moments:
  initialCount: 10
  batchSize: 10
---
```

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
