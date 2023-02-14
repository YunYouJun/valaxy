---
title: FAQ
title_zh-CN: 常见问题
categories:
  - Dev
end: false
---

## JavaScript heap out of memory

Limit `--max-old-space-size` to reproduce.

```bash
pnpm test:space
```

超过 50 篇文章时需要超过 2G 内存。

内存使用需要优化……

## `background-attachment: fixed` iOS 不支持

> iOS has an issue preventing background-attachment: fixed from being used with background-size: cover.
> [The Fixed Background Attachment Hack | CSS Tricks](https://css-tricks.com/the-fixed-background-attachment-hack/)

改为使用 `::before` 伪元素实现。

## 文章列表中的标签文字被分解

将文章标签 `tags` 如下格式：
```bash
tags: 
    - 我的标签
```
