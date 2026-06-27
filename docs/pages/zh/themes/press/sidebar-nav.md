---
title: 主题 Press 导航栏与侧边栏
categories:
  - theme
---

## 导航栏 {#nav}

`themeConfig.nav` 控制顶部导航。导航项可以是直接链接，也可以是下拉分组。

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      {
        text: '生态',
        items: [
          { text: '插件', link: '/addons/' },
          { text: '主题', link: '/themes/' },
        ],
      },
    ],
  },
})
```

`text` 可以是普通文本，也可以是 `locales/*.yml` 中的 i18n key。

## 侧边栏 {#sidebar}

Press 支持与 VitePress 相近的配置风格：数组表示单一侧边栏，对象表示按路径前缀区分的多侧边栏。

### 基于分类自动生成 {#category-sidebar}

将分类名称加入 `themeConfig.sidebar`，再在页面 frontmatter 中使用相同的 `categories`：

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: ['guide', 'reference'],
  },
})
```

```md [pages/guide/getting-started.md]
---
title: 快速开始
categories:
  - guide
---
```

这种方式适合偏博客或知识库式的文档，页面顺序可由生成列表决定。

### 显式树结构 {#explicit-tree}

需要精确排序、嵌套分组、外部链接或可折叠分组时使用显式树结构：

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: [
      {
        text: '指南',
        collapsed: false,
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '配置', link: '/guide/config' },
          {
            text: '进阶',
            collapsed: true,
            items: [
              { text: 'Markdown', link: '/guide/markdown' },
              { text: '部署', link: '/guide/deploy' },
            ],
          },
        ],
      },
    ],
  },
})
```

`docFooterText` 可以自定义上一页/下一页导航中展示的标题：

```ts
const item = {
  text: '配置',
  link: '/guide/config',
  docFooterText: '配置 Valaxy',
}
```

### 多侧边栏 {#multiple-sidebars}

当文档存在多个子目录时，可以使用以路径为 key 的对象。Press 会按当前路由选择最长匹配的路径前缀。

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '配置', link: '/api/config' },
            { text: '方法', link: '/api/methods' },
          ],
        },
      ],
    },
  },
})
```

### Base Path {#base-path}

使用 `base` 可以避免重复书写共同路径前缀。这个格式与 VitePress 的 sidebar object 格式一致。

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
              { text: '配置', link: 'config' },
            ],
          },
        ],
      },
    },
  },
})
```

当侧边栏数组包含没有 `items` 的顶层链接时，Press 会把连续的链接收拢为匿名分组，以贴近 VitePress 默认侧边栏的渲染模型。
