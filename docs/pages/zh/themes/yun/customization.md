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

## 404 页面 {#not-found}

主题默认的 404 布局会显示当前路径和「返回」按钮。配置 `notFound.issueLink` 后，还会出现一个反馈按钮，自动预填失效路径，方便读者报告坏链。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    notFound: {
      // 会追加 `?title=404: <路径>&body=...`
      issueLink: 'https://github.com/user/repo/issues/new',
      // 也可以用 `:path` 自定义位置（会被替换为编码后的路径）
      // issueLink: 'https://example.com/feedback?url=:path',
    },
  },
})
```

标题默认取 `pages/404.md` 的 `title`，未知路径时回退到主题文案「页面不存在」。

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
