---
title: 页面
categories:
  - guide
---

## FrontMatter {#frontmatter}

你可以使用 front-matter 定制页面属性。


::: tip

更多配置项可参见：

- 页面（Page）配置：[PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/page.ts)



::: details PageFrontmatter Types

<<< @/../packages/valaxy/types/frontmatter/page.ts#snippet{29-194 ts:line-numbers}

:::

### titleTemplate {#titletemplate}

```md
---
title: Cool
titleTemplate: '%s - Valaxy'
---
```

这样可以使 HTML 标题变为 `Cool - Valaxy`。


### 页面加密 {#encrypt-page}


::: warning


加密依赖于浏览器原生 [Web Crypto API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)，
**其仅在 HTTPS 中可用**。

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


在对应需要加密页面的 frontmatter 中添加 `password: YourPassword` 即可。

当 `encrypt.enable` 为 `true`，且页面中密码 `password` 存在时，默认开启加密。

被加密的内容应在解密后动态渲染。此时无法（也不应）参与到构建流程中生成静态产物（否则会被直接看到）。
因此对于加密内容中的图片路径，总是应该使用绝对路径而非相对路径。



```md
---
password: valaxy
---
```

### 其它 {#other}


- `sidebar: false`: 隐藏左侧文章导航栏
- `aside: false`: 隐藏右侧文章导航栏
- `toc: false`: 隐藏目录
- `codeHeightLimit: 300`: 代码块高度限制（300px）




