---
title: Page
categories:
  - guide
---

## FrontMatter


You can custom page by front-matter.

::: tip


More configuration options can be found in:

- Page configuration: [PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/page.ts)


::: details PageFrontmatter Types

<<< @/../packages/valaxy/types/frontmatter/page.ts#snippet{29-194 ts:line-numbers}

:::

### titleTemplate

```md
---
title: Cool
titleTemplate: '%s - Valaxy'
---
```


You will get html title `Cool - Valaxy`.


### Encrypt Page

::: warning


Encryption relies on the browser's native [Web Crypto API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API),
**It is only available in HTTPS**.
:::

```ts [site.config.ts]
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


Add `password: YourPassword` to the frontmatter of the corresponding page to enable encryption.

When `encrypt.enable` is `true`, and the password `password` exists in the page, encryption is enabled by default.

The encrypted content should be dynamically rendered after decryption.
At this time, it cannot (and should not) participate in the build process to generate static artifacts (otherwise it will be seen directly).

```md
---
password: valaxy
---
```


### Other


- `sidebar: false`: Hide Left Sidebar
- `aside: false`: Hide Right Aside
- `toc: false`: Hide TOC
- `codeHeightLimit: 300`: Code block height limit（300px）

