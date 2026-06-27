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
      {
        text: '资源',
        items: [
          { text: '更新日志', link: '/changelog/' },
          { text: 'GitHub', link: 'https://github.com/acme/project' },
        ],
      },
    ],

    sidebar: [
      'guide',
      {
        text: '参考',
        collapsed: false,
        items: [
          { text: '配置', link: '/reference/config' },
          { text: 'CLI', link: '/reference/cli' },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/acme/project/edit/main/docs/:path',
      text: '编辑此页',
    },

    socialLinks: [
      { icon: 'i-ri-github-line', link: 'https://github.com/acme/project' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2026 Acme.',
    },
  },
})
```

## 主题配置参考 {#theme-config-reference}

下表列出 Press 自身的 `themeConfig` 选项。站点级配置，例如 `title`、`url`、`search`、`lastUpdated`，仍然放在 `siteConfig` 下。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `logo` | `string` | `''` | 顶部导航栏 Logo。通常使用 `/favicon.svg` 这样的 public 路径。 |
| `colors.primary` | `string` | `'#0078E7'` | 主题色，会注入 Press SCSS 与 Valaxy 主题变量。 |
| `nav` | `NavItem[]` | `[]` | 顶部导航链接与下拉分组。 |
| `sidebar` | `Sidebar` | `[]` | 左侧边栏。支持分类名、显式树结构，以及按路径区分的多侧边栏。 |
| `editLink.pattern` | `string` | Valaxy 文档仓库编辑地址 | 页底“编辑此页”链接模板。`:path` 会被替换为页面相对路径。 |
| `editLink.text` | `string` | 多语言默认文案 | 自定义编辑链接文案。 |
| `footer.message` | `string` | `undefined` | 页脚说明。允许 HTML。 |
| `footer.copyright` | `string` | `undefined` | 页脚版权信息。允许 HTML。 |
| `socialLinks` | `SocialLink[]` | `[]` | 导航栏中的图标链接。图标使用 UnoCSS 图标类，例如 `i-ri-github-line`。 |
| `locales` | `Record<string, LocaleSpecificConfig>` | `undefined` | 语言切换器数据，以及每种语言的 `themeConfig` 覆盖。 |
| `i18nRouting` | `boolean` | `false` | 切换语言时尽量保持当前路径。 |

## 首页 {#home-page}

使用 `layout: home`，并在 frontmatter 中配置 `hero` 与 `features`。

```md [pages/index.md]
---
layout: home

title: Acme Docs

hero:
  name: Acme
  text: 使用 Acme 更快构建
  tagline: 安装、配置与扩展 Acme 所需的一切。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
      type: fly
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/acme/project

features:
  - icon: i-logos:vitejs
    title: 快速
    details: 基于 Vite 与 Valaxy。
  - icon: i-logos:vue
    title: 可扩展
    details: 可以直接在 Markdown 中使用 Vue 组件。
---
```

当 `i18nRouting` 启用时，首页按钮中的内部链接会自动补齐当前语言前缀。

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

Press 支持两种常见侧边栏写法。

第一种是基于分类自动生成。将分类名称加入 `themeConfig.sidebar`，再在页面 frontmatter 中使用相同的 `categories`：

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

第二种是显式树结构。需要精确排序、嵌套分组、外部链接或可折叠分组时使用这种方式：

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
{
  text: '配置',
  link: '/guide/config',
  docFooterText: '配置 Valaxy',
}
```

## 搜索 {#search}

当 `siteConfig.search.enable` 为 `true` 时，Press 会显示搜索入口。

多数文档站建议使用基于 MiniSearch 的本地搜索：

```ts [valaxy.config.ts]
export default defineValaxyConfig({
  siteConfig: {
    search: {
      enable: true,
      provider: 'local',
    },
  },
})
```

Press 也支持 Valaxy 的 Fuse 搜索：

```ts
export default defineValaxyConfig({
  siteConfig: {
    search: {
      enable: true,
      provider: 'fuse',
    },
  },
})
```

如果要使用 Algolia DocSearch，将 provider 设置为 `algolia` 并安装 Algolia 插件：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonAlgolia } from 'valaxy-addon-algolia'

export default defineValaxyConfig({
  siteConfig: {
    search: {
      enable: true,
      provider: 'algolia',
    },
  },
  addons: [
    addonAlgolia({
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
    }),
  ],
})
```

如果某个页面不希望进入本地搜索索引，可以在页面 frontmatter 中设置 `search: false`。

## 多语言站点 {#i18n}

使用 `locales` 配置语言切换器和每种语言的主题配置覆盖。启用 `i18nRouting` 后，切换语言时会尽量保持当前路径。

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    languages: ['en', 'zh-CN'],
  },
  themeConfig: {
    i18nRouting: true,
    locales: {
      root: {
        label: 'English',
        lang: 'en',
      },
      zh: {
        label: '简体中文',
        lang: 'zh-CN',
        link: '/zh/',
        themeConfig: {
          nav: [
            { text: '指南', link: '/zh/guide/getting-started' },
          ],
          sidebar: ['guide'],
          editLink: {
            pattern: 'https://github.com/acme/project/edit/main/docs/:path',
            text: '编辑此页',
          },
        },
      },
    },
  },
})
```

翻译页面放在对应语言前缀下：

```txt
pages/
├── guide/getting-started.md
└── zh/guide/getting-started.md
```

## 页脚与编辑链接 {#footer-edit-link}

编辑链接会显示在文章页底部。`pattern` 中的 `:path` 会被替换为当前页面的相对路径。

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    lastUpdated: true,
  },
  themeConfig: {
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

如果某个页面不希望显示上一页/下一页导航，可以在页面 frontmatter 中设置 `nav: false`。

## 页面布局 {#page-layouts}

Press 提供以下常见布局：

| 布局 | 用途 |
| --- | --- |
| `default` | 标准文档页 |
| `home` | 带 hero 和 features 的首页 |
| `posts` | 文章列表页 |
| `post` | 博客文章详情页 |
| `tags` | 标签归档页 |
| `404` | 404 页面 |

归档页示例：

```md [pages/posts/index.md]
---
title: Posts
layout: posts
---
```

```md [pages/tags/index.md]
---
title: Tags
layout: tags
---
```

## 样式 {#styling}

通过 `themeConfig.colors.primary` 设置主题色：

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    colors: {
      primary: '#0078E7',
    },
  },
})
```

也可以在自己的样式文件中覆盖 Press CSS 变量：

```scss [styles/index.scss]
:root {
  --pr-nav-height-mobile: 56px;
  --pr-nav-text: var(--va-c-text-1);
}
```

## 组件自定义 {#component-customization}

和其他 Valaxy 主题一样，你可以在站点中创建同名组件来覆盖 Press 的默认组件。常见扩展点包括：

| 组件 | 用途 |
| --- | --- |
| `PressHomeHero.vue` | 首页 hero |
| `PressHomeFeatures.vue` | 首页功能网格 |
| `PressNavBar.vue` | 顶部导航栏 |
| `PressSidebar.vue` | 左侧边栏 |
| `PressDocFooter.vue` | 编辑链接与上一页/下一页 |
| `PressArticle.vue` | 文档文章容器 |

更底层的主题开发细节可参考 [编写主题](/zh/themes/write)。

## 从 VitePress 迁移 {#migrating-from-vitepress}

Press 刻意保留了许多 VitePress 用户熟悉的体验，但它不是 `.vitepress/config.ts` 的直接替代品。

- 将站点和主题配置迁移到 `valaxy.config.ts`、`site.config.ts` 或 `theme.config.ts`。
- 将内容放入 Valaxy 的 `pages/` 目录。
- 使用 Valaxy frontmatter，例如 `categories`、`layout`、`search`。
- 通过 `siteConfig.search.provider` 配置搜索。
- 需要 Algolia、Git 贡献者、评论、音乐等集成时，使用 Valaxy 插件。

常见映射关系：

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

Valaxy 官方文档本身就是 Press 的最大实际示例。完整配置可参考 [docs/valaxy.config.ts](https://github.com/YunYouJun/valaxy/blob/main/docs/valaxy.config.ts)。
