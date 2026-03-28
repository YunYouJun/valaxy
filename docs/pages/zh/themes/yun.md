---
title: 主题 Yun
categories:
  - theme
---

::: tip
类型定义：[valaxy-theme-yun/types/index.d.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/types/index.d.ts)
:::

## 快速开始 {#quick-start}

```bash
pnpm add valaxy-theme-yun
```

```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeConfig>({
  theme: 'yun',
  themeConfig: {
    // ...
  },
})
```

你也可以将主题配置提取到单独的 `theme.config.ts` 文件中：

```ts [theme.config.ts]
import { defineThemeConfig } from 'valaxy-theme-yun'

export default defineThemeConfig({
  // ...
})
```

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

> 如果您想要更改云的色彩，请覆盖 CSS 变量 `--yun-c-cloud`：
>
> ```css
> :root {
>   --yun-c-cloud: red;
> }
> ```

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
