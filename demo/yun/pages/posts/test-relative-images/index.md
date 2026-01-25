---
title: Test Relative Images
date: 2024-12-26
categories: test
tags:
  - test
  - images
---

这是一篇测试相对路径图片的文章。

## 相对路径图片测试

下面是使用 `./` 前缀的相对路径：

![Test Image with ./](./bg-img.jpg)

<!-- more -->

## 更多内容

这篇文章主要用于测试在构建时相对路径图片是如何被处理的。

- 图片文件名：`bg-img.jpg`
- Markdown 引用：`![Test Image](./bg-img.jpg)`
- 预期构建后会带 hash：`/assets/bg-image.xxxxx.jpg`

让我们看看 RSS feed 中会如何展示这些图片路径。
