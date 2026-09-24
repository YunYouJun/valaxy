---
title: 主题 Yun 配置
categories:
  - theme
---

## 主题类型 {#type}

Yun 主题支持两种布局类型，通过 `themeConfig.type` 切换：

- `nimbo`（默认）：现代布局。顶部导航栏 + 首页 Banner 动画 + 全屏菜单（移动端）。
- `strato`：经典布局。左侧边栏 + 顶部导航栏，类似传统博客风格。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    type: 'nimbo', // 或 'strato'
  },
})
```

::: tip
`strato` 对应 v1 版本的布局风格，`nimbo` 对应 v2 版本的布局风格。
在未来，Yun 主题的不同布局变更将以不同云的名称命名（如 cirro 卷云、cumulo 积云、alto 高云等）。
:::

## 配色 {#colors}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    colors: {
      /**
       * 主题色
       * @default '#0078E7'
       */
      primary: '#0078E7',
    },
  },
})
```

## 导航栏 {#nav}

页面顶部的导航栏。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    nav: [
      { text: '文章', link: '/posts/', icon: 'i-ri-article-line' },
      { text: '友链', link: '/links/', icon: 'i-ri-link' },
    ],
  },
})
```

每个 `NavItem` 包含以下属性：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 显示文本（支持 i18n key，如 `menu.posts`） |
| `link` | `string` | 链接地址 |
| `icon` | `string` | 图标名称，参见 [Icônes](https://icones.js.org/) |
| `active` | `string` | 激活路由匹配模式 |

## 页面 {#pages}

显示在首页侧栏社交链接下方的页面入口。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    pages: [
      {
        name: '友情链接',
        url: '/links/',
        icon: 'i-ri-link',
        color: 'dodgerblue',
      },
      {
        name: '项目列表',
        url: '/projects',
        icon: 'i-ri-gallery-view',
        color: 'var(--va-c-text)',
      },
    ],
  },
})
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 页面名称 |
| `url` | `string` | 页面链接 |
| `icon` | `string` | 图标名称，参见 [Icônes](https://icones.js.org/) |
| `color` | `string` | 原有链接颜色；移动端首页导航将此颜色用于图标 |
| `iconColor` | `string` | 独立图标颜色（CSS 值），优先于 `color`，不改变文字颜色 |

### 首页移动导航 {#home-navigation}

Nimbo 首页支持通过 `banner.navStyle` 选择移动端导航样式，桌面排布不受影响：

| 值 | 效果 |
| --- | --- |
| `plain`（默认） | 彩色图标与文字，保留更多留白 |
| `glass` | 中性玻璃胶囊与边缘反光 |
| `panel` | 将入口收拢在一块磨砂面板中 |
| `tiles` | 为每个图标添加同色的淡彩底座 |

移动端导航采用两列对齐，每项触控区域至少 48px 高。默认的 `plain` 样式使用透明背景，悬停和按下时提供轻微反馈，键盘聚焦时显示清晰的轮廓。

每个页面可以使用不同的 `iconColor`。移动端文字保持主题前景色，图标不需要共用主题色；内置「博客文章」入口跟随 `colors.primary`。

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  banner: { navStyle: 'plain' },
  pages: [
    { name: '小随想', url: '/moments/', icon: 'i-ri-chat-1-line', iconColor: '#009B81' },
    { name: '项目列表', url: '/projects', icon: 'i-ri-gallery-view', iconColor: '#C47B16' },
    { name: '相册', url: '/albums', icon: 'i-ri-image-line', iconColor: '#8863D7' },
  ],
})
```

Yun demo 的 `/examples/navigation` 页面可对比四种样式、明暗模式和图标配色。

## 侧边栏 {#sidebar}

`docs` 布局会在页面左侧渲染这组导航。你可以为所有文档提供一份侧边栏，
也可以按路径前缀配置多份侧边栏。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
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
          {
            text: '进阶',
            collapsed: true,
            items: [
              { text: '部署', link: 'deployment' },
            ],
          },
        ],
      },
    },
  },
})
```

在页面 frontmatter 中设置 `layout: docs` 即可启用。配置了 `collapsed` 的分组
可以折叠；`true` 表示初始收起，`false` 表示初始展开。

## 页脚 {#footer}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    footer: {
      since: 2022,

      cloud: {
        enable: true, // 页脚上方的流动云
      },

      icon: {
        enable: true,
        name: 'i-ri-heart-fill',
        animated: true,
        color: 'red',
        url: '',
        title: '',
      },

      powered: true, // 显示 "Powered by Valaxy & valaxy-theme-yun"

      beian: {
        enable: false,
        icp: '', // 如 '苏ICP备xxxxxxxx号'
        icpLink: 'https://beian.miit.gov.cn/',
        police: '', // 公安网备案号
      },
    },
  },
})
```
