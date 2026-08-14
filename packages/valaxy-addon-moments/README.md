# valaxy-addon-moments

一个 valaxy 插件，实现类朋友圈的小随想页面功能。每条动态使用 Markdown 编写，在单一时间线中展示完整内容，并沿用 Valaxy 普通文章的图片放大体验。

## 特性

- 通过 `pages/moments/*.md` 静态发布，不需要数据库和登录系统。
- 支持完整 Markdown 正文、发布时间、位置、置顶及 1–9 张九宫格图片。
- 自动排除生产环境中的草稿和隐藏内容。
- 渐进加载长时间线，继承主题颜色变量并支持亮暗主题。

## 安装

```bash
pnpm add valaxy-addon-moments
```

在 `valaxy.config.ts` 中：

```ts []
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

插件会自动提供 `/moments/` 页面。可以把它加入主题导航，无需手动创建索引页。

在 `theme.config.ts` 中配置：

```ts
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  nav: [
    { text: '小随想', link: '/moments/', icon: 'i-ri-chat-1-line' },
  ],
  
  pages: [
    {
      name: '小随想',
      url: '/moments/',
      icon: 'i-ri-chat-1-line',
    },
  ],
})
```

## 编写动态

在站点中新建 `pages/moments/2026-08-13-sunset.md`：

```md
---
date: 2026-08-13 18:30
location: 上海
images:
  - src: /images/moments/sunset.webp
    alt: 傍晚的天空
---

下班时遇到了很好看的晚霞。

今天也是值得记录的一天。
```

请显式填写 `date`，保证不同环境中的排序结果稳定。正文使用 Valaxy 的完整 Markdown 处理流程，代码块、自定义容器和正文图片均可正常使用。

`images` 同时接受字符串和对象：

```yaml
images:
  - /images/moments/one.webp
  - src: /images/moments/two.webp
    alt: 图片说明
    width: 1200
    height: 800
```

插件不截断图片数组，但推荐每条最多九张。图片可以使用站点 `public` 下的根路径或 HTTPS URL；为图片填写准确的 `alt` 有助于无障碍访问。

置顶、草稿和隐藏内容使用标准 frontmatter：

```yaml
top: 2
draft: true
hide: index
```

`top` 越大越靠前；相同优先级按 `date` 倒序。开发模式会显示草稿，生产构建会排除 `draft` 和任何 `hide` 动态。`draft` 只是构建过滤，并不是真正的访问权限控制。

## 配置

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `Moments` | 时间线标题。 |
| `description` | `string` | - | 标题下方的说明。 |
| `initialCount` | `number` | `10` | 首批显示数量。 |
| `batchSize` | `number` | `10` | 每次“加载更多”增加的数量。 |
| `author` | `{ name?: string, avatar?: string }` | 站点作者 | 覆盖卡片中的作者名称和头像。 |

包会自动注册 `ValaxyMoments` 和 `ValaxyMomentCard`，也可通过组件子路径导入；根入口导出 `useMoments`、`useMomentsConfig`、数据规范化工具及相关 TypeScript 类型。

## 图片预览

插件使用 Valaxy 的 `ValaxyMd` 和 `mediumZoom`，行为与普通文章一致。在站点配置 `site.config.ts` 中开启：

```ts
export default defineValaxyConfig({
  siteConfig: {
    mediumZoom: {
      enable: true,
    },
  },
})
```

## TODO

目前的点赞按钮为装饰按钮，仅显示本地浏览器点赞数据，无法同步云端。考虑引入腾讯云 EdgeOne Makers 的 KV 存储实现同步点赞数据功能（等开通审批通过再来开发），其他托管平台暂时未研究。

## License

MIT
