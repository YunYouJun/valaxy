---
title: Post
title_zh-CN: 文章
categories:
  - Guide
---

## FrontMatter

**文章**（`post`）继承自**页面**（`page`），因此**页面**中的 Frontmatter 通用被**文章**支持。

> 单篇文章支持的配置项。

譬如：

```md
---
title: Title
hide: true
---
```

- `title`: 文章标题
- `hide`: 你可以在文章头部添加 hide 属性，来临时隐藏某篇文章。（该文章仍然会被渲染）
  - `true` / `all`: 当设置为 `true` 或 `all` 时，该文章仍然会被渲染，你可以直接访问链接进行查看。但不会被显示在展示的文章卡片与归档中。
  - `index`: 设置为 `index` 时，将只在首页隐藏，归档中仍然展示。（譬如放一些没有必要放在首页的笔记，并在归档中方便自己查看。）

## 摘要

你可以通过插入 `<!-- more -->` 的方式生成摘要（excerpt）。

```md
---
title: 嘿嘿嘿
---

这里是摘要

<!-- more -->

这里是正文
```
