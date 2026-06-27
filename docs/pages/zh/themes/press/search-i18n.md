---
title: 主题 Press 搜索与多语言
categories:
  - theme
---

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

翻译页面放在对应语言前缀下：

```txt
pages/
├── guide/getting-started.md
└── zh/guide/getting-started.md
```
