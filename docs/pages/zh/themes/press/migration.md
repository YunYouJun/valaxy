---
title: 从 VitePress 迁移到主题 Press
categories:
  - theme
---

Press 刻意保留了许多 VitePress 用户熟悉的体验，但它不是 `.vitepress/config.ts` 的直接替代品。

- 将站点和主题配置迁移到 `valaxy.config.ts`、`site.config.ts` 或 `theme.config.ts`。
- 将内容放入 Valaxy 的 `pages/` 目录。
- 使用 Valaxy frontmatter，例如 `categories`、`layout`、`search`。
- 通过 `siteConfig.search.provider` 配置搜索。
- 需要 Algolia、Git 贡献者、评论、音乐等集成时，使用 Valaxy 插件。

## 常见映射 {#common-mappings}

| VitePress | Valaxy + Press |
| --- | --- |
| `.vitepress/config.ts` | `valaxy.config.ts`、`site.config.ts` 或 `theme.config.ts` |
| `title`、`description` | `siteConfig.title`、`siteConfig.description` |
| `themeConfig.logo` | `themeConfig.logo` |
| `themeConfig.nav` | `themeConfig.nav` |
| `themeConfig.sidebar` | `themeConfig.sidebar` |
| `themeConfig.socialLinks` | `themeConfig.socialLinks` |
| `themeConfig.editLink` | `themeConfig.editLink` |
| `themeConfig.footer` | `themeConfig.footer` |
| `lastUpdated` | `siteConfig.lastUpdated` |
| `locales` | `themeConfig.locales` 与 `siteConfig.languages` |
| `themeConfig.search.provider: 'local'` | `siteConfig.search.provider: 'local'` |
| `.vitepress/theme` 自定义布局/组件 | 在 Valaxy 站点中创建同名组件覆盖 |
| VitePress 插件 | Valaxy 插件，或 `valaxy.config.ts` 中的 Vite 插件 |

## 侧边栏说明 {#sidebar-notes}

Press 支持 VitePress 风格的 sidebar 数组、按路径区分的多侧边栏，以及 `{ base, items }` 对象：

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: '指南',
            items: [
              { text: '介绍', link: '' },
              { text: '快速开始', link: 'getting-started' },
            ],
          },
        ],
      },
    },
  },
})
```

Valaxy 特有的补充是：顶层字符串（如 `'guide'`）仍然会根据页面 `categories` 自动展开。
