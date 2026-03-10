---
title: Post
categories:
  - guide
end: false
---

> [Post VS Page](https://wordpress.com/zh-cn/support/post-vs-page/)

## FrontMatter

::: tip


More configuration options can be found in:

- Post configuration: [PostFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/post.ts) (Post configuration extends page configuration)
- Page configuration: [PageFrontmatter](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy/types/frontmatter/page.ts) (See [Page | Valaxy](/guide/page))


::: details PostFrontmatter Types

<<< @/../packages/valaxy/types/frontmatter/post.ts#snippet{ts:line-numbers}

:::


`post` is a descendant of `page`, so the front matter in **pages** are supported by **posts**.

For example:

```md
---
title: Title
hide: true
---
```


- `title`: Title of the article.
- `hide`: Adding `hide` in the header allows you to hide the article temporarily. (The article will still be rendered)
  - `true` / `all`: When set to `true` or `all`, the article will be rendered, and you can view it by visiting the link directly. It will not be displayed in article cards or archives.
  - `index`: When set to `index`, it will be hidden only in the front page. It will still be displayed in archives. (You can use this for some notes unnecessary for the front page, but good for the archive for reference sometimes)


## Excerpt


You can insert `<!--more-->` to generate an excerpt.
You can set the excerpt rendering type by setting `excerpt_type`.

- `excerpt`: Custom excerpt (higher priority than `<!-- more -->`)
- `excerpt_type`: The rendering type for the excerpt in the preview list (Used with `<!-- more -->`)
  - `md`: Display as original markdown
  - `html`: Display as HTML
  - `text`: Display as text (removing HTML tags)


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


## Insert


### Components


- To insert existing public components in the article, please refer to [Components](/guide/built-ins).
- To insert custom components in the article, please refer to [Custom Components](/guide/custom/components).


### Scripts


You can use [`useScriptTag`](https://vueuse.org/core/useScriptTag/) directly, encapsulate it as a component, or add it directly to the article.


```vue
<script lang="ts" setup>
useScriptTag('https://static.codepen.io/assets/embed/ei.js')
</script>
```


## Force Standard


Since Valaxy supports parsing Vue component rendering, when you enter `<CustomComponent></CustomComponent>`, it will parse the `CustomComponent.vue` component in the `components` directory and render it.

When you don't want it to be rendered, be sure to wrap it in backticks, like:


```md
`<CustomComponent></CustomComponent>`
```
