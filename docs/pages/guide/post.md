---
title:
  en: Post
  zh-CN: 文章
categories:
  - guide
end: false
---

> [Post VS Page](https://wordpress.com/zh-cn/support/post-vs-page/)

## FrontMatter

::: tip

<div lang="zh-CN">
更多配置项可参见：

- 文章（Post）配置：[PostFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/post.ts) （文章配置包含页面配置）
- 页面（Page）配置：[PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/page.ts) （可参见[页面配置 | Valaxy](/guide/page)）

</div>

<div lang="en">
More configuration options can be found in:

- Post configuration: [PostFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/post.ts) (Post configuration extends page configuration)
- Page configuration: [PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/page.ts) (See [Page | Valaxy](/guide/page))

</div>

::: details PostFrontmatter Types

<<< @/../packages/valaxy/types/frontmatter/post.ts#snippet{ts:line-numbers}

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
:::

::: en

- `title`: Title of the article.
- `hide`: Adding `hide` in the header allows you to hide the article temporarily. (The article will still be rendered)
  - `true` / `all`: When set to `true` or `all`, the article will be rendered, and you can view it by visiting the link directly. It will not be displayed in article cards or archives.
  - `index`: When set to `index`, it will be hidden only in the front page. It will still be displayed in archives. (You can use this for some notes unnecessary for the front page, but good for the archive for reference sometimes)

:::

## 摘要 {lang="zh-CN"}

## Excerpt {lang="en"}

::: zh-CN
你可以通过插入 `<!-- more -->` 的方式生成摘要（excerpt）。
可通过设置 `excerpt_type` 设置摘要渲染类型。

- `excerpt`: 自定义摘要（优先级高于 `<!-- more -->`）
- `excerpt_type`: 预览列表**摘要**的渲染类型（与 `<!-- more -->` 配合使用）
  - `md`: 展示原始 Markdown
  - `html`: 以 HTML 形式展示
  - `text`: 以纯文本形式展示（去除 HTML 标签）

:::

::: en
You can insert `<!--more-->` to generate an excerpt.
You can set the excerpt rendering type by setting `excerpt_type`.

- `excerpt`: Custom excerpt (higher priority than `<!-- more -->`)
- `excerpt_type`: The rendering type for the excerpt in the preview list (Used with `<!-- more -->`)
  - `md`: Display as original markdown
  - `html`: Display as HTML
  - `text`: Display as text (removing HTML tags)

:::

::: code-group

```md{3,10} [excerpt_type: text]
---
title: 'excerpt_type: text'
excerpt_type: text
---

## Header

![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)

<!-- more -->

Main Content
```

```md{3,10} [excerpt_type: md]
---
title: 'excerpt_type: md'
excerpt_type: md
---

## Header

![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)

<!-- more -->

Main Content
```

```md{3,10} [excerpt_type: html]
---
title: 'excerpt_type: html'
excerpt_type: html
---

## Header

![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)

<!-- more -->

Main Content
```

```md{3} [custom excerpt]
---
title: 'custom excerpt'
excerpt: This is a custom excerpt.
---

## Header

![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)

Main Content
```

:::

You will get excerpt:

::: code-group

```md [excerpt_type: text]
HEADER yun-bg
```

```md [excerpt_type: md]
## Header ![yun-bg](https://cdn.yunyoujun.cn/img/bg/stars-timing-0-blur-30px.jpg)
```

```md [excerpt_type: html]
<!-- Rendered HTML -->
```

```md [custom excerpt]
This is a custom excerpt.
```

:::

## 插入 {lang="zh-CN"}

## Insert {lang="en"}

### 组件 {lang="zh-CN"}

### Components {lang="en"}

::: zh-CN

- 如想在文章中插入现有公共组件，请参照 [组件](/guide/built-ins)。
- 如想在文章中插入自定义组件，请参照 [自定义组件](/guide/custom/components)。

:::

::: en

- To insert existing public components in the article, please refer to [Components](/guide/built-ins).
- To insert custom components in the article, please refer to [Custom Components](/guide/custom/components).

:::

### 脚本 {lang="zh-CN"}

### Scripts {lang="en"}

::: zh-CN

可直接通过 [`useScriptTag`](https://vueuse.org/core/useScriptTag/) 使用，封装为组件或直接添加在文章中。

:::

::: en

You can use [`useScriptTag`](https://vueuse.org/core/useScriptTag/) directly, encapsulate it as a component, or add it directly to the article.

:::

```vue
<script lang="ts" setup>
useScriptTag('https://static.codepen.io/assets/embed/ei.js')
</script>
```

## 强制规范 {lang="zh-CN"}

## Force Standard {lang="en"}

::: zh-CN

由于 Valaxy 支持解析 Vue 组件渲染，因此当您输入 `<CustomComponent></CustomComponent>` 时，它会解析 `components` 目录下的 `CustomComponent.vue` 组件并渲染。

当您不需要其被渲染时，请务必使用反引号包裹，如：

:::

::: en

Since Valaxy supports parsing Vue component rendering, when you enter `<CustomComponent></CustomComponent>`, it will parse the `CustomComponent.vue` component in the `components` directory and render it.

When you don't want it to be rendered, be sure to wrap it in backticks, like:

:::

```md
`<CustomComponent></CustomComponent>`
```
