---
title: Theme Press Search And i18n
categories:
  - theme
---

## Search {#search}

Press renders the search box when `siteConfig.search.enable` is `true`.

For most documentation sites, use MiniSearch local search:

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

Press also supports Valaxy's Fuse provider:

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

For Algolia DocSearch, set the provider to `algolia` and install the Algolia addon:

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

Set `search: false` in page frontmatter to exclude one page from local search indexing.

## Multi-Language Sites {#i18n}

Use `locales` to configure the language switcher and per-locale theme overrides. Enable `i18nRouting` when switching languages should keep the current route path.

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
          sidebar: {
            '/zh/guide/': {
              base: '/zh/guide/',
              items: [
                {
                  text: '指南',
                  items: [
                    { text: '快速开始', link: 'getting-started' },
                  ],
                },
              ],
            },
          },
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

Place translated pages under the matching prefix:

```txt
pages/
├── guide/getting-started.md
└── zh/guide/getting-started.md
```
