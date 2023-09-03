---
title: Post
title_zh-CN: 文章
categories:
  - Guide
end: false
---

> [Post VS Page](https://wordpress.com/zh-cn/support/post-vs-page/)

## FrontMatter

::: tip

更多配置项可参见：

- 文章（Post）配置：[PostFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/posts.ts#L144) （文章配置包含页面配置）
- 页面（Page）配置：[PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/posts.ts#L27)

:::

::: zh-CN
**文章**（`post`）继承自**页面**（`page`），因此**页面**中的 Front Matter 通用被**文章**支持。

> 单篇文章支持的配置项。

譬如：
:::

::: en
`post` is a descendant of `page`, so the front matter in **pages** are supported by **posts**.

For example:
:::

```md
---
title: Title
hide: true
---
```

::: zh-CN

- `title`: 文章标题
- `hide`: 你可以在文章头部添加 hide 属性，来临时隐藏某篇文章。（该文章仍然会被渲染）
  - `true` / `all`: 当设置为 `true` 或 `all` 时，该文章仍然会被渲染，你可以直接访问链接进行查看。但不会被显示在展示的文章卡片与归档中。
  - `index`: 设置为 `index` 时，将只在首页隐藏，归档中仍然展示。（譬如放一些没有必要放在首页的笔记，并在归档中方便自己查看。）
- `excerpt_type`: 预览列表**摘要**的渲染类型（与 `<!-- more -->` 配合使用）
  - `md`: 展示原始 Markdown
  - `html`: 以 HTML 形式展示
  - `text`: 以纯文本形式展示（去除 HTML 标签）

:::

::: en

- `title`: Title of the article.
- `hide`: Adding `hide` in the header allows you to hide the article temporarily. (The article will still be rendered)
  - `true` / `all`: When set to `true` or `all`, the article will be rendered, and you can view it by visiting the link directly. It will not be displayed in article cards or archives.
  - `index`: When set to `index`, it will be hidden only in the front page. It will still be displayed in archives. (You can use this for some notes unnecessary for the front page, but good for the archive for reference sometimes)
- `excerpt_type`: The rendering type for the excerpt in the preview list (Used with `<!-- more -->`)
  - `md`: Display as original markdown
  - `html`: Display as HTML
  - `text`: Display as text (removing HTML tags)

:::

## 摘要 {lang="zh-CN"}

::: zh-CN
你可以通过插入 `<!-- more -->` 的方式生成摘要（excerpt）。
可通过设置 `excerpt_type` 设置摘要渲染类型。

```md
---
title: 嘿嘿嘿
excerpt_type: text
---

这里是摘要

<!-- more -->

这里是正文
```

:::

## Excerpt {lang="en"}

::: en
You can insert `<!--more-->` to generate an excerpt.
You can set the excerpt rendering type by setting `excerpt_type`.

```md
---
title: Hello
excerpt_type: text
---

This is the experpt

<!-- more -->

Here goes the body
```

:::

## 插入

### 组件

- 如想在文章中插入现有公共组件，请参照 [组件](/guide/built-ins)。
- 如想在文章中插入自定义组件，请参照 [自定义组件](/guide/custom/components)。

### 脚本

可直接通过 [`useScriptTag`](https://vueuse.org/core/useScriptTag/) 使用，封装为组件或直接添加在文章中。

```vue
<script lang="ts" setup>
useScriptTag('https://static.codepen.io/assets/embed/ei.js')
</script>
```
