# Valaxy Documentation i18n Conventions

## File Structure

```
docs/
├── pages/                    # English (default language)
│   ├── index.md
│   ├── guide/
│   │   ├── getting-started.md
│   │   └── ...
│   ├── themes/
│   ├── addons/
│   └── zh/                   # Chinese translations (mirror structure)
│       ├── index.md
│       ├── guide/
│       │   ├── getting-started.md
│       │   └── ...
│       ├── themes/
│       └── addons/
├── locales/
│   ├── en.yml                # English UI strings
│   └── zh-CN.yml             # Chinese UI strings
└── components/               # Shared Vue components
```

## Container Syntax

This project uses **3 colons** for all Markdown containers:

```md
::: tip
Content
:::

::: warning
Content
:::

::: details Title
Content
:::

::: danger
Content
:::
```

## Frontmatter Format

### Guide Documentation (path-based i18n)

English file frontmatter:
```yaml
---
title: Getting Started
categories:
  - guide
---
```

Chinese file frontmatter (only title translated):
```yaml
---
title: 起步
categories:
  - guide
---
```

### Blog Posts (container-based i18n, same file)

```yaml
---
title:
  en: English Title
  zh-CN: 中文标题
---
```

## Heading ID Convention

Chinese headings MUST include explicit English IDs matching the English version:

```md
<!-- English file -->
## Theme Examples
### App.vue

<!-- Chinese file -->
## 主题示例 {#theme-examples}
### App.vue {#app-vue}
```

## Internal Link Convention

| Context | Link Format | Example |
|---------|------------|---------|
| English doc → English doc | No prefix | `/guide/getting-started` |
| Chinese doc → Chinese doc | `/zh/` prefix | `/zh/guide/getting-started` |
| English doc → anchor | English slug | `[State Management](#global-state-management)` |
| Chinese doc → anchor | English slug | `[全局状态管理](#global-state-management)` |

## Proper Nouns (Do Not Translate)

Keep these terms in their original form across both languages:

- **Project names**: Valaxy, Vue, Vite, UnoCSS, Pinia, VueUse, Shiki, NProgress
- **Package names**: `valaxy-theme-yun`, `@valaxyjs/utils`, `create-valaxy`
- **Technical terms**: frontmatter, SSR, SSG, HMR, SPA, CDN, CLI
- **API identifiers**: `useValaxyHead`, `defineTheme`, `useSiteConfig`, `useThemeConfig`, `defineValaxyConfig`
- **File paths and names**: `valaxy.config.ts`, `site.config.ts`, `App.vue`, `setup/main.ts`
- **CSS/HTML identifiers**: class names, attribute names, CSS property names

## Common Translation Pairs

| Chinese | English |
|---------|---------|
| 起步 | Getting Started |
| 指南 | Guide |
| 配置 | Configuration / Config |
| 主题 | Theme |
| 插件 | Addon / Plugin |
| 样式 | Styles |
| 功能 | Features |
| 部署 | Deploy / Deployment |
| 自定义 | Custom / Customize |
| 组件 | Components |
| 布局 | Layout |
| 模板 | Template |
| 文章 | Post |
| 分类 | Categories |
| 标签 | Tags |
| 目录 | Table of Contents |
| 评论 | Comments |
| 引用静态资源 | Referencing Static Assets |
| 第三方插件 | Third Party Plugin |
| 全局状态管理 | Global State Management |
| 上一篇/下一篇 | Previous/Next Post |
| 开始编写 | Start Writing |
| 创建主题模板 | Creating a Theme Template |

## Special Formatting Notes

1. **Code block labels**: Preserve `[filename]` labels, e.g., `` ```ts [valaxy.config.ts] ``
2. **Vue component references**: Keep component names in PascalCase (e.g., `ValaxyMain`)
3. **Emoji/Icons**: Keep UnoCSS icon class names unchanged (e.g., `i-ri-translate`)
4. **blockquote links**: Translate link text but keep the URL path correct for the target language
5. **Valaxy-specific syntax**: `$t()`, `$tTag()`, `$tCategory()` function references stay in code format
