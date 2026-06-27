---
title: 主题 Yun 布局与视觉
categories:
  - theme
---

## 首页标语 {#banner}

首页的垂直交错排列文字效果。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
      // 手动分割
      // title: ['云游君的', '小站'],
      // 支持 i18n
      // title: { 'zh-CN': '云游君的小站', en: ['Hello', 'World'] },

      cloud: {
        enable: true, // 首页下方的流动云动画
      },

      // 自定义站点名称 CSS 类
      siteNameClass: '',
      // 动画持续时间（仅 nimbo 模式）
      duration: 500,
    },
  },
})
```

如果您想要更改云的色彩，请覆盖 CSS 变量 `--yun-c-cloud`：

```css
:root {
  --yun-c-cloud: red;
}
```

## 背景图 {#bg-image}

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    bg_image: {
      enable: true,
      url: '/images/bg.jpg',
      dark: '/images/bg-dark.jpg', // 深色模式
      opacity: 1,
    },
  },
})
```

也可以通过 CSS 变量覆盖：

```css
:root {
  --yun-bg-img: url("/images/bg.jpg");
  --yun-sidebar-bg-img: url("/images/sidebar-bg.jpg");
}
```
