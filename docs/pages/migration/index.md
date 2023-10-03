---
title: Migration from Other
title_zh-CN: 从其他博客框架迁移
categories:
  - migration
top: 10
---

## 从 Hexo 迁移至 Valaxy

- [从 Hexo 迁移至 Valaxy](/migration/hexo)

## 从其他任意博客框架迁移

- 将你的文章（Markdown 文件）复制至 Valaxy `pages/posts` 目录下。
- 将你的自定义页面（非文章的 Markdown/HTML 文件）复制至 Valaxy `pages` 目录下。
- 将你的静态资源（图片等）复制至 Valaxy `public` 目录下。
- 参考 [配置](/guide/config) 配置你的配置文件 `valaxy.config.ts`/`site.config.ts`。

## 常见问题 {lang="zh-CN"}

## Common Problems {lang="en"}

### 摘要截断符 {lang="zh-CN"}

### Read More Separator {lang="en"}

::: zh-CN
默认为 `<!-- more -->`，`more` 前后需有空格。
:::

::: en
Default to `<-- More -->`, there are spaces before and after `more`.
:::

### Markdown 换行 {lang="zh-CN"}

### Newline in Markdown {lang="en"}

::: zh-CN
Valaxy 的 Markdown 解析基于 [`markdown-it`](https://github.com/markdown-it/markdown-it) 实现。

`markdown-it` 的策略在 Markdown 中换行后渲染的内容并没有换行：

```md
第一行
没有换行
```

第一行
没有换行

---

如果需要正常换行，需在末尾添加两个空格：

```md
第一行（末尾有两个空格）  
换行了
```

第一行（末尾有两个空格）  
换行了
:::

::: en
Markdown rendering in Valaxy is based on [`markdown-it`](https://github.com/markdown-it/markdown-it).

The default strategy of `markdown-it` does not wrap the rendered content when wrapping in Markdown:

```md
first line
second line but not wrapped
```

first line
second line but not wrapped

---

If you want to move the second line to a new line, add two spaces at the end of the first line:

```md
first line (with two spaces at the end)  
second line got wrapped corrently
```

first line (with two spaces at the end)  
second line got wrapped corrently
:::
