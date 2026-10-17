---
title: Theme Yun Customization
categories:
  - theme
---

## Edit Link {#edit-link}

Add an "Edit this page" link to posts.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/user/repo/edit/main/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
```

## 404 Page {#not-found}

The default 404 layout shows the current path and a "Back" button. Set `notFound.issueLink` to also show a report button that pre-fills the missing path, so readers can report broken links.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    notFound: {
      // appends `?title=404: <path>&body=...`
      issueLink: 'https://github.com/user/repo/issues/new',
      // or place the path yourself with `:path` (replaced by the encoded path)
      // issueLink: 'https://example.com/feedback?url=:path',
    },
  },
})
```

The title comes from the `title` of `pages/404.md`, falling back to the theme's "Page not found" for unknown paths.

## Outline Title {#outline-title}

Table of contents heading text.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    /**
     * @default 'On this page'
     */
    outlineTitle: 'On this page',
  },
})
```

## Styles {#styles}

Override theme styles by creating `styles/index.ts`:

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
