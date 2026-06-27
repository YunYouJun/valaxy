---
title: Theme Press Navigation And Sidebar
categories:
  - theme
---

## Navigation {#nav}

`themeConfig.nav` controls the top navigation. A nav item can be a direct link or a dropdown group.

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      {
        text: 'Ecosystem',
        items: [
          { text: 'Addons', link: '/addons/' },
          { text: 'Themes', link: '/themes/' },
        ],
      },
    ],
  },
})
```

`text` can be plain text or an i18n key from your `locales/*.yml` files.

## Sidebar {#sidebar}

Press supports the same broad configuration style as VitePress: an array for a single sidebar, or an object keyed by path prefix for multiple sidebars.

### Category-Driven Sidebar {#category-sidebar}

Add a category name to `themeConfig.sidebar`, then mark pages with the same `categories` value:

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: ['guide', 'reference'],
  },
})
```

```md [pages/guide/getting-started.md]
---
title: Getting Started
categories:
  - guide
---
```

This style is convenient for blog-like docs where page order can follow the generated page list.

### Explicit Tree {#explicit-tree}

Use an explicit tree when you need exact order, nested groups, external links, or collapsible sections:

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/config' },
          {
            text: 'Advanced',
            collapsed: true,
            items: [
              { text: 'Markdown', link: '/guide/markdown' },
              { text: 'Deployment', link: '/guide/deploy' },
            ],
          },
        ],
      },
    ],
  },
})
```

`docFooterText` customizes the label shown in previous/next page navigation:

```ts
const item = {
  text: 'Configuration',
  link: '/guide/config',
  docFooterText: 'Configure Valaxy',
}
```

### Multiple Sidebars {#multiple-sidebars}

For documentation with subdirectories, use a path-keyed object. Press selects the longest matching path prefix for the current route.

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Config', link: '/api/config' },
            { text: 'Methods', link: '/api/methods' },
          ],
        },
      ],
    },
  },
})
```

### Base Path {#base-path}

Use `base` to avoid repeating a common prefix. This mirrors VitePress' sidebar object format.

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
              { text: 'Configuration', link: 'config' },
            ],
          },
        ],
      },
    },
  },
})
```

When a sidebar array contains top-level links without `items`, Press groups consecutive links into an anonymous group, matching VitePress' default sidebar rendering model.
