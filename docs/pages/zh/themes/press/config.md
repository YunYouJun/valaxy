---
title: 主题 Press 配置
categories:
  - theme
---

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
