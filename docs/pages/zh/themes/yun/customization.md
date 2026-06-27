---
title: 主题 Yun 自定义
categories:
  - theme
---

## 编辑链接 {#edit-link}

为文章添加「在 GitHub 中编辑」链接。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/user/repo/edit/main/:path',
      text: '在 GitHub 上编辑此页',
    },
  },
})
```

## 大纲标题 {#outline-title}

目录标题文本。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    /**
     * @default 'On this page'
     */
    outlineTitle: '本页目录',
  },
})
```

## 样式 {#styles}

通过创建 `styles/index.ts` 覆盖主题样式：

```ts [styles/index.ts]
import './vars.scss'
```

```scss [styles/vars.scss]
:root {
  --yun-bg-img: url("https://example.com/bg.jpg");
  --yun-sidebar-bg-img: url("https://example.com/sidebar.jpg");
  --yun-c-cloud: pink;
}
```
