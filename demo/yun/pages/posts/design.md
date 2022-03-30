---
title: Valaxy 设计原则
date: 2022-03-29
end: false
---

## 特点

与 Hexo 相比，没有 `_drafts` 文件夹。

当在 drafts 文件夹下编写博文时，我不得不在它和 posts 文件夹下来回移动，以预览最终效果。

Valaxy 认为这完全没有必要，您只需在 `frontmatter` 中添加 `draft: true` 属性，即可将其设置为草稿。

当需要发布时，注释掉它即可。

譬如：

```markdown
---
draft: true
---
```

也许你可能认为放在对应文件夹下适合快速查找拥有哪些草稿，但是你通过编辑器的全局搜索 `draft: true` 同样可以快速做到。
并且你还能知道你之前打算把它发布在哪个文件夹（路径）下。
