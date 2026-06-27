---
title: 主题 Press
categories:
  - theme
---

::: tip
类型定义：[valaxy-theme-press/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-press/types/index.d.ts)
:::

`valaxy-theme-press` 是 Valaxy 官方的文档主题。它的交互与组织方式受 VitePress 启发，但运行在 Valaxy 的路由、Markdown、插件、多语言与博客数据系统之上。

当你要构建文档站、项目手册、知识库，或一个同时需要文章、分类、标签、插件和自定义 Vue 组件的文档型站点时，可以选择 Press。

## 快速开始 {#quick-start}

最简单的方式是在创建 Valaxy 项目时选择 **Press**：

```bash
pnpm create valaxy
```

如果你已经有一个 Valaxy 项目，可以手动安装主题并将 `theme` 设置为 `press`：

```bash
pnpm add valaxy-theme-press
```

```ts [valaxy.config.ts]
import type { PressTheme } from 'valaxy-theme-press'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<PressTheme.Config>({
  theme: 'press',
  themeConfig: {
    logo: '/favicon.svg',
  },
})
```

你也可以将主题配置拆到 `theme.config.ts` 中：

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-press'

export default defineThemeConfig({
  logo: '/favicon.svg',
})
```

## 文档地图 {#documentation-map}

- [配置参考](/zh/themes/press/config)：`themeConfig` 选项、首页、页脚、布局、样式与组件覆盖。
- [导航栏与侧边栏](/zh/themes/press/sidebar-nav)：顶部导航、分类侧边栏、显式树结构、多侧边栏与 `base`。
- [搜索与多语言](/zh/themes/press/search-i18n)：本地搜索、Fuse、Algolia、语言切换器与多语言配置。
- [从 VitePress 迁移](/zh/themes/press/migration)：VitePress 用户迁移时的配置映射与注意事项。

## 最小文档站配置 {#minimal-docs-site}

一个实用的文档站通常会配置站点信息、搜索、导航、侧边栏、编辑链接和页脚：

```ts [valaxy.config.ts]
import type { PressTheme } from 'valaxy-theme-press'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    title: 'Acme Docs',
    url: 'https://docs.example.com',
    description: 'Documentation for Acme',
    search: {
      enable: true,
      provider: 'local',
    },
    lastUpdated: true,
  },

  theme: 'press',
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: '指南',
            items: [
              { text: '快速开始', link: 'getting-started' },
              { text: '配置', link: 'config' },
            ],
          },
        ],
      },
    },
    editLink: {
      pattern: 'https://github.com/acme/project/edit/main/docs/:path',
      text: '编辑此页',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2026 Acme.',
    },
  },
})
```

Valaxy 官方文档本身就是 Press 的最大实际示例。完整配置可参考 [docs/valaxy.config.ts](https://github.com/YunYouJun/valaxy/blob/main/docs/valaxy.config.ts)。
