---
title: RSS Image Path Test
date: 2024-12-26
categories: test
tags:
  - rss
  - images
---

这是一篇测试 RSS feed 中图片路径的文章。

## 绝对路径图片

下面是使用绝对路径的图片（以 `/` 开头）：

![RSS Test Image](/images/rss-test.svg)

<!-- more -->

## 说明

在 RSS feed 中，这个图片路径应该被转换为完整的 URL：
- Markdown 中：`/images/rss-test.svg`
- RSS 中应该是：`https://yun.valaxy.site/images/rss-test.svg`

这样 RSS 阅读器才能正确加载图片。
