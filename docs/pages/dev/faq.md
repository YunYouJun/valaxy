---
title: FAQ
title_zh: 常见问题
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

## 合并

使用 `defu`。

但实测 defu faster than `@fastify/deepmerge`。

合并单个配置：

- `defu`: 0.06ms
- `@fastify/deepmerge`: 0.256ms

- [`@fastify/deepmerge`](https://github.com/fastify/deepmerge)。

```bash
# benchmark
@fastify/deepmerge x 605,343 ops/sec ±0.87% (96 runs sampled)
deepmerge x 20,312 ops/sec ±1.06% (92 runs sampled)
merge-deep x 83,167 ops/sec ±1.30% (94 runs sampled)
ts-deepmerge x 175,977 ops/sec ±0.57% (96 runs sampled)
deepmerge-ts x 174,973 ops/sec ±0.44% (93 runs sampled)
lodash.merge x 89,213 ops/sec ±0.70% (98 runs sampled)
```
