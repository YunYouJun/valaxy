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
