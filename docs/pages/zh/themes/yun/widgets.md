---
title: 主题 Yun 功能组件与页面
categories:
  - theme
---

## 公告 {#notice}

显示公告横幅。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    notice: {
      enable: true,
      hideInPages: false, // 是否在 /pages/[page] 中隐藏
      content: '欢迎来到我的博客！',
    },
  },
})
```

## 说说 {#say}

随机展示一句话。

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  themeConfig: {
    say: {
      enable: true,
      api: '', // 自定义 API 链接或 public/ 下的 JSON 路径
      hitokoto: {
        enable: true,
        api: 'https://v1.hitokoto.cn',
      },
    },
  },
})
```

## 烟花 {#fireworks}

点击烟花效果，基于 [@explosions/fireworks](https://www.npmjs.com/package/@explosions/fireworks)。

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

## 文章卡片类型 {#types}

自定义文章类型标记，可配置图标和颜色。

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

然后在文章 frontmatter 中设置 `type`：

```md
---
title: 我的视频
type: bilibili
url: https://www.bilibili.com/video/xxx
---
```

## 菜单 {#menu}

最右侧的自定义导航图标。

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

## 友情链接页面 {#links}

新建 `pages/links/index.md`：

```md
---
title: 我的小伙伴们
links:
  - url: https://www.yunyoujun.cn
    avatar: https://www.yunyoujun.cn/images/avatar.jpg
    name: 云游君
    blog: 云游君的小站
    desc: 希望能成为一个有趣的人。
    color: "#0078e7"
# 也可以是一个 JSON 链接
# links: https://friends.yunyoujun.cn/links.json
random: true
---

<YunLinks :links="frontmatter.links" :random="frontmatter.random" />
```
