---
title: FAQ
title_zh-CN: 常见问题
categories:
  - dev
end: false
---

<details>

<summary>已解决</summary>

## JavaScript heap out of memory

Limit `--max-old-space-size` to reproduce.

```bash
pnpm test:space
```

~~超过 50 篇文章时需要超过 2G 内存。~~
升级 vite-ssg （使用 p-queue 队列）已解决。

## `background-attachment: fixed` iOS 不支持

> iOS has an issue preventing background-attachment: fixed from being used with background-size: cover.
> [The Fixed Background Attachment Hack | CSS Tricks](https://css-tricks.com/the-fixed-background-attachment-hack/)

改为使用 `::before` 伪元素实现。

</details>
