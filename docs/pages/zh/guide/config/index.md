---
title: 基础配置
categories:
  - config
end: false
---

## 配置说明 {#configurations}


为了便于配置，Valaxy 将配置分为了三种。

`valaxy.config.ts` 是配置的主入口，它包含了以下配置。

- `siteConfig`: 站点**信息**配置，这部分内容面向站点展示，且在不同主题中也是通用的格式
- `themeConfig`: 主题配置，这部分内容仅在特定主题生效
- `runtimeConfig`: 运行时的配置（由 Valaxy 自动生成），用户无需配置
- 其他 Valaxy 通用配置内容（如需要在 Node 端处理的配置 `unocss`/`addons`）

譬如：


```ts [valaxy.config.ts]
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { addonComponents } from 'valaxy-addon-components'
import { VitePWA } from 'vite-plugin-pwa'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts or write in siteConfig
  siteConfig: {},

  theme: 'yun',
  themeConfig: {
    banner: {
      enable: true,
      title: '云游君的小站',
    },
  },

  vite: {
    // https://vite-pwa-org.netlify.app/
    plugins: [VitePWA()],
  },

  unocss: {
    safelist,
  },

  addons: [
    addonComponents()
  ],
})
```

## 站点配置 {#site-config}


> 更多详细配置可参见 [types/config.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/config.ts)。

::: details packages/valaxy/types/config.ts SiteConfig

<<< @/../packages/valaxy/types/config.ts#snippet{ts:line-numbers}

:::

站点**信息**配置，这部分内容面向站点展示且在任何主题也是通用的格式。

你也可以将其写在 `site.config.ts` 中。

譬如：

```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  lang: 'zh-CN',
  title: 'Valaxy Theme Yun',
  url: 'https://valaxy.site/',
  author: {
    name: '云游君',
    avatar: 'https://www.yunyoujun.cn/images/avatar.jpg',
  },
  /**
   * 站点图标
   */
  favicon: 'https://www.yunyoujun.cn/favicon.svg',
  /**
   * 副标题
   */
  subtitle: 'All at sea.',
  description: 'Valaxy Theme Yun Preview.',
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    }
  ],

  sponsor: {
    enable: true,
    methods: [
      {
        name: '支付宝',
        url: 'https://cdn.yunyoujun.cn/img/donate/alipay-qrcode.jpg',
        color: '#00A3EE',
        icon: 'i-ri-alipay-line',
      },
    ],
  },
})
```



### 作者信息 {#作者信息}

更多字段可参考上文类型或直接在编辑器提示中查看。

```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  author: {
    name: '你的名字',
    /**
     * Your avatar
     * 头像链接
     */
    avatar: 'https://xxx',
    intro: '个人简介'
  }
})
```

### 时区 {#时区}

如果你使用 CI/CD 构建部署，远程机器可能处于其他时区，你可以设置时区。

此时将会默认使用该时区格式化时间，并设置 `process.env.TZ` 变量。

如果你托管于其他平台，你可能需要在对应平台添加环境变量。

```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  timezone: 'Asia/Shanghai'
})
```

### 文章排序 {#post-sorting}



设置 `siteConfig.orderBy` 可控制文章列表的排序方式。

- `date`: 按照文章的日期排序（默认）
- `updated`: 按照文章的最后更新时间排序

当 `lastUpdated` 开启时，将会为未设置 `updated` 的文章自动注入文件的最后更新时间。



```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  orderBy: 'updated',
})
```

### Default Frontmatter {#default-frontmatter}

为所有文章设置默认的 Frontmatter。

譬如：

> 设置 `time_warning: false`，则所有文章都不会显示阅读时间警告。

```ts {7-9} [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  /**
   * 默认 Frontmatter
   */
  frontmatter: {
    time_warning: false,
  }
})
```



### 社交图标 {#social-icons}



```ts
export interface SocialLink {
  /**
   * 社交链接名称
   */
  name: string
  link: string
  /**
   * 图标名称
   * https://icones.js.org/
   */
  icon: string
  color: string
}
```

示例：


```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'QQ 群 1050458482',
      link: 'https://qm.qq.com/cgi-bin/qm/qr?k=kZJzggTTCf4SpvEQ8lXWoi5ZjhAx0ILZ&jump_from=webapi',
      icon: 'i-ri-qq-line',
      color: '#12B7F5',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/YunYouJun',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
  ]
})
```

### 赞助 {#sponsor}


> 在每篇文章末尾，展示赞助（打赏）信息。

```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  sponsor: {
    enable: true,
    methods: [
      {
        name: '支付宝',
        url: 'https://cdn.yunyoujun.cn/img/donate/alipay-qrcode.jpg',
        color: '#00A3EE',
        icon: 'i-ri-alipay-line',
      },
      {
        name: '微信支付',
        url: 'https://cdn.yunyoujun.cn/img/donate/wechatpay-qrcode.jpg',
        color: '#2DC100',
        icon: 'i-ri-wechat-pay-line',
      },
    ],
  },
})
```

你可以通过 `sponsor` 属性控制全局是否开启。


```ts
interface SponsorOption {
  enable: boolean
  title: string
  methods: {
    name: string
    url: string
    color: string
    icon: string
  }[]
}
```

或为某篇文章的 Front Matter 单独设置：


```md
---
title: xxx
sponsor: false
---
```

### 阅读统计 {#阅读统计}

开启阅读统计，将会在每篇文章开头展示阅读统计信息。

> 需要主题进行适配，即展示 `frontmatter` 中的 `wordCount` 和 `readingTime` 字段。

- `wordCount`：字数统计
- `readingTime`：阅读时长（分钟）
  - 可以设置不同语言的阅读速度，默认 `cn` 为 300 字/分钟，`en` 为 200 字/分钟。

```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  /**
   * 开启阅读统计
   */
  statistics: {
    enable: true,
    readTime: {
      /**
       * 阅读速度
       */
      speed: {
        cn: 300,
        en: 200,
      },
    },
  }
})
```

### 代码块高度限制 {#code-height-limit}


你可以为每篇文章设置代码块高度限制。


譬如设置 `codeHeightLimit: 300`，则文章中所有代码块高度都不会超过 300px，并自动折叠。


```ts {5}
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  // ...
  codeHeightLimit: 300,
})
```

你也可以在文章的 Front Matter 中单独设置：


```md {2}
---
codeHeightLimit: 300
---
```

示例可参见 [代码块高度限制](/zh/examples/code-height-limit)。


### 内容加密 {#content-encryption}


首先在 `site.config.ts` 中开启加密


```ts {5-7}
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  // ...
  encrypt: {
    enable: true,
  }
})
```


- 加密整篇文章


在文章的 Front Matter 中设置 `password`：


```md {2}
---
password: your_password
password_hint: 自定义密码提示
---
```


- 加密部分内容


::: tip

如果在文章的 Front Matter 中设置了 `password`，文章中的部分加密将被忽略。


:::

将待加密的内容包裹在 `<!-- valaxy-encrypt-start:your_password --><!-- valaxy-encrypt-end -->` 中。


示例可参见 [部分内容加密](/zh/examples/partial-content-encryption)。


### 客户端重定向 {#client-redirects}


```ts
interface Redirects {
  // https://router.vuejs.org/guide/essentials/redirect-and-alias.html
  // Whether to use VueRouter, default is true
  useVueRouter?: boolean
  rules?: RedirectRule[]
}
interface RedirectRule {
  // Redirect original route
  from: string | string[]
  // Redirect target route
  to: string
}
```

示例：


```ts [site.config.ts]
export default defineSiteConfig({
  redirects: {
    useVueRouter: true,
    rules: [
      {
        from: ['/foo', '/bar'],
        to: '/about',
      },
      {
        from: '/v1/about',
        to: '/about',
      },
    ]
  },
})
```

`/foo`, `/bar`, `/v1/about` 这些路由会被重定向到 `/about`。


你也可以在 Front Matter 中配置：


```md
<!-- pages/posts/redirect.md -->
---
from:
  - /redirect/old1
  - /redirect/old2
---
```

```md
<!-- pages/posts/redirect.md -->
---
from: /v1/redirect
---
```

`/redirect/old1`, `/redirect/old2`, `/v1/redirect` 这些路由会被重定向到 `/posts/redirect`。


::: tip

在 SSG 构建时，如果 useVueRouter 为 false，则会为每一个源路由生成一个 html 文件


:::

### 图片预览（Medium Zoom） {#image-preview-medium-zoom}


Valaxy 内置了 [medium-zoom](https://github.com/francoischalifour/medium-zoom) 进行图片预览，默认关闭。

> [Medium Zoom Demo](https://medium-zoom.francoischalifour.com/)

- mediumZoom
  - `enable`: 是否开启
  - `selector`: 可自定义传入选择器
  - `options`: 与 [options | medium-zoom](https://github.com/francoischalifour/medium-zoom#options) 一致

譬如开启 Medium Zoom：


```ts [site.config.ts]
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  mediumZoom: { enable: true }
})
```

除此之外，你也可以单独控制是否在某篇文章中开启。


```md
---
title: Test Medium Zoom
medium_zoom: true
---
```

### 懒加载 Vanilla Lazyload {#lazyload-vanilla-lazyload}



Valaxy 内置了 [vanilla-lazyload](https://github.com/verlok/vanilla-lazyload)。

`vanillaLazyload` 默认不开启。
因为 Valaxy 本身会为所有的图片添加 `loading="lazy"`，它是浏览器的特性，但如果你希望得到更广泛的兼容，你可以手动开启 `vanillaLazyload`。



```ts
export default defineSiteConfig({
  vanillaLazyload: {
    // 默认不开启
    enable: true,
  }
})
```

### 更多配置 {#更多配置}

> 更多详细配置可参见 [types/config.ts](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/config.ts)。

::: details packages/valaxy/types/config.ts SiteConfig

<<< @/../packages/valaxy/types/config.ts#snippet{ts:line-numbers}

:::

## 主题配置 {#theme-config}


参照 [使用主题](/zh/themes/use) 及您所使用的主题文档进行配置。


## 扩展配置 {#扩展配置}

更多高阶配置请参见 [扩展配置](/zh/guide/config/extend)。

