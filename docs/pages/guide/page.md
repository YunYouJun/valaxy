---
title: Page
title_zh-CN: 页面
categories:
  - Guide
---

## FrontMatter

::: zh-CN
你可以使用 front-matter 定制页面属性。
:::

::: en
You can custom page by front-matter.
:::

::: tip

更多配置项可参见：

- 页面（Page）配置：[PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/posts.ts#L27)

:::

### titleTemplate

```md
---
title: Cool
titleTemplate: '%s - Valaxy'
---
```

::: zh-CN
这样可以使 HTML 标题变为 `Cool - Valaxy`。
:::

::: en
You will get html title `Cool - Valaxy`.
:::

### 页面加密

::: warning
加密依赖于浏览器原生 [Web Crypto API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)，
**其仅在 HTTPS 中可用**。
:::

```ts
// site.config.ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  encrypt: {
    // 开启加密，默认关闭
    enable: true
    // algorithm
    // iv
    // salt
  }
})
```

在对应需要加密页面的 frontmatter 中添加 `password: YourPassword` 即可。

当 `encrypt.enable` 为 `true`，且页面中密码 `password` 存在时，默认开启加密。

```md
---
password: valaxy
---
```

### 其它 {lang="zh-CN"}

::: zh-CN

- `toc: false`: 隐藏目录
- `aside: false`: 隐藏右侧文章导航栏

:::

### Other {lang="en"}

::: en

- `toc: false`: Hide TOC
- `aside: false`: Hide Right Aside

:::
