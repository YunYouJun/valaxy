---
title: 主题 Yun
categories:
  - theme
---

::: tip
类型定义：[valaxy-theme-yun/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/types/index.d.ts)
:::

`valaxy-theme-yun` 是 Valaxy 的默认博客主题，适合个人博客、文章归档、友情链接、首页标语动画与主题自定义。

## 快速开始 {#quick-start}

```bash
pnpm add valaxy-theme-yun
```

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'yun',
  themeConfig: {
    type: 'nimbo',
  },
})
```

你也可以将主题配置提取到单独的 `theme.config.ts` 文件中：

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  type: 'nimbo',
})
```

## 文档地图 {#documentation-map}

- [配置参考](/zh/themes/yun/config)：主题类型、配色、导航栏、页面入口、侧边栏与页脚。
- [布局与视觉](/zh/themes/yun/layout)：首页标语、背景图与布局相关配置。
- [功能组件与页面](/zh/themes/yun/widgets)：公告、说说、烟花、文章卡片类型、菜单与友链页。
- [自定义](/zh/themes/yun/customization)：编辑链接、大纲标题与样式覆盖。
