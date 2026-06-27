---
title: Migrating From VitePress To Theme Press
categories:
  - theme
---

Press intentionally feels familiar to VitePress users, but it is not a drop-in `.vitepress/config.ts` replacement.

- Move site and theme config into `valaxy.config.ts`, `site.config.ts`, or `theme.config.ts`.
- Put content in Valaxy's `pages/` directory.
- Use Valaxy frontmatter such as `categories`, `layout`, and `search`.
- Configure search through `siteConfig.search.provider`.
- Use Valaxy addons when you need integrations such as Algolia, Git log contributors, comments, or music.

## Common Mappings {#common-mappings}

| VitePress | Valaxy + Press |
| --- | --- |
| `.vitepress/config.ts` | `valaxy.config.ts`, `site.config.ts`, or `theme.config.ts` |
| `title`, `description` | `siteConfig.title`, `siteConfig.description` |
| `themeConfig.logo` | `themeConfig.logo` |
| `themeConfig.nav` | `themeConfig.nav` |
| `themeConfig.sidebar` | `themeConfig.sidebar` |
| `themeConfig.socialLinks` | `themeConfig.socialLinks` |
| `themeConfig.editLink` | `themeConfig.editLink` |
| `themeConfig.footer` | `themeConfig.footer` |
| `lastUpdated` | `siteConfig.lastUpdated` |
| `locales` | `themeConfig.locales` plus `siteConfig.languages` |
| `themeConfig.search.provider: 'local'` | `siteConfig.search.provider: 'local'` |
| `.vitepress/theme` custom layout/components | Same-name component overrides in the Valaxy site |
| VitePress plugins | Valaxy addons or Vite plugins in `valaxy.config.ts` |

## Sidebar Notes {#sidebar-notes}

Press supports VitePress-style sidebar arrays, path-keyed multi-sidebars, and `{ base, items }` objects:

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: 'Guide',
            items: [
              { text: 'Introduction', link: '' },
              { text: 'Getting Started', link: 'getting-started' },
            ],
          },
        ],
      },
    },
  },
})
```

The main Valaxy-specific addition is that a top-level string such as `'guide'` still expands from page `categories`.
