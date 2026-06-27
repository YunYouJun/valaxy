---
title: Theme Yun Widgets And Pages
categories:
  - theme
---

## Notice {#notice}

Display an announcement banner.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    notice: {
      enable: true,
      hideInPages: false, // Whether to hide in /pages/[page]
      content: 'Welcome to my blog!',
    },
  },
})
```

## Say {#say}

Random quote/sentence display.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    say: {
      enable: true,
      api: '', // Custom API URL or local JSON path in public/
      hitokoto: {
        enable: true,
        api: 'https://v1.hitokoto.cn',
      },
    },
  },
})
```

## Fireworks {#fireworks}

Click fireworks effect powered by [@explosions/fireworks](https://www.npmjs.com/package/@explosions/fireworks).

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    fireworks: {
      enable: true,
      colors: ['#66A7DD', '#3E83E1', '#214EC2'],
    },
  },
})
```

## Post Card Types {#types}

Custom post type badges with icon and color.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    types: {
      link: {
        color: '#1890ff',
        icon: 'i-ri-link',
      },
      bilibili: {
        color: '#FF8EB3',
        icon: 'i-ri-bilibili-line',
      },
    },
  },
})
```

Then set `type` in post frontmatter:

```md
---
title: My Video
type: bilibili
url: https://www.bilibili.com/video/xxx
---
```

## Menu {#menu}

Custom navigation icon on the far right.

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    menu: {
      custom: {
        title: 'Menu',
        url: '/',
        icon: 'i-ri-menu-line',
      },
    },
  },
})
```

## Friend Links Page {#links}

Create `pages/links/index.md`:

```md
---
title: My Friends
links:
  - url: https://www.yunyoujun.cn
    avatar: https://www.yunyoujun.cn/images/avatar.jpg
    name: YunYouJun
    blog: YunYouJun's Blog
    desc: Hope to be an interesting person.
    color: "#0078e7"
# Or use a JSON URL
# links: https://friends.example.com/links.json
random: true
---

<YunLinks :links="frontmatter.links" :random="frontmatter.random" />
```
