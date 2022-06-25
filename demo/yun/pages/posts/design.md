---
title: Valaxy 设计原则
date: 2022-03-29
end: false
tags:
  - design
---

## 特点 {lang="zh-CN"}

::: zh-CN
与 Hexo 相比，没有 `_drafts` 文件夹。（当然自己新建也完全没问题……）

当在 drafts 文件夹下编写博文时，我不得不在它和 posts 文件夹下来回移动，以预览最终效果。

Valaxy 认为这完全没有必要，您只需在 `frontmatter` 中添加 `draft: true` 属性，即可将其设置为草稿。
草稿状态的文章在构建以及生成 RSS 时会被过滤，但你仍然可以在开发时预览它。

当需要发布时，注释掉它即可。

譬如：
:::

## Features {lang="en"}

::: en
Compared with Hexo, There is no `_drafts` folder. (Of course, it is no problem to create the folder……)

When writing a blog post under the drafts folder, I had to move back and forth under it and the posts folder to preview the final effect.

Valaxy doesn't think this is necessary at all. You can set it as draft by adding the 'draft: true' attribute to 'frontmatter'.
Articles with status draft are filtered when building and generating RSS, but you can still preview it at development time.

When you need to publish, just comment it out.

For example:
:::

```markdown
---
draft: true
---
```

::: zh-CN
也许你可能认为放在对应文件夹下适合快速查找拥有哪些草稿，但是你通过编辑器的全局搜索 `draft: true` 同样可以快速做到。
并且你还能知道你之前打算把它发布在哪个文件夹（路径）下。
:::

::: en
You may think that putting it in the corresponding folder is suitable for quickly finding which drafts you have, but you can also do it quickly through the editor's global search 'draft: true'.
And you can also know which folder (path) you planned to publish it in.
:::
