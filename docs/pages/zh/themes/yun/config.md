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
| `color` | `string` | 图标颜色（CSS 值），默认 `var(--va-c-text)` |

## 侧边栏 {#sidebar}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    sidebar: {
      // 侧边栏配置
    },
  },
})
```

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
