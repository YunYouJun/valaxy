---
title: Best Practice
title_zh-CN: 最佳实践
categories:
  - Guide
top: 1
---

以下是我们推荐的部分最佳实践，但您不必完全遵守。

## 文章

- 使用英文命名文件夹与文件，如 `/posts/your-post.md`。
- 如需使用本地图片（且仅在对应文章中展示），您可以新建文件夹 `/posts/your-post/`，并将图片放置其中，如 `/posts/your-post/your-image.png`。
  - <https://github.com/YunYouJun/valaxy/issues/259>
- 插入第三方/大量动态内容时，优先将其封装为组件放置于 `components`，并通过组件标签名引入。
