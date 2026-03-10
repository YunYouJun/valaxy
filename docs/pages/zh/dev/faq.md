---
title: FAQ
categories:
  - dev
end: false
---

<details>

<summary>已解决</summary>

## `background-attachment: fixed` iOS 不支持

> iOS has an issue preventing background-attachment: fixed from being used with background-size: cover.
> [The Fixed Background Attachment Hack | CSS Tricks](https://css-tricks.com/the-fixed-background-attachment-hack/)

改为使用 `::before` 伪元素实现。

</details>


## JavaScript heap out of memory


During SSG build (`valaxy build --ssg`), [vite-ssg](https://github.com/antfu-collective/vite-ssg) runs client build, server build, and page rendering in the same process. The Vite resolved config and plugin system from the build phase remain in memory, leaving limited heap space for the rendering phase.

**Minimum memory requirement: `--max-old-space-size=2304` (~2.3 GB)**

```bash
# Reproduce tests
pnpm test:space        # demo/yun
pnpm test:space:docs   # docs
```

Valaxy automatically adjusts SSG behavior based on V8's `heap_size_limit`:

| Heap Limit | beasties (Critical CSS) | HTML minify | Concurrency |
|------------|------------------------|-------------|-------------|
| ≤ 2.5 GB | Disabled | Disabled | 1 |
| ≤ 3.1 GB | Enabled | Enabled | 2 |
| ≤ 4.2 GB | Enabled | Enabled | 4 |
| > 4.2 GB | Enabled | Enabled | 8+ |

If you encounter OOM in CI environments, increase the heap limit via `NODE_OPTIONS`:

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build --ssg
```


## 合并

使用 `defu`。

但实测 `defu` faster than `@fastify/deepmerge`。

合并单个配置：

- `defu`: 0.06ms
- [`@fastify/deepmerge`](https://github.com/fastify/deepmerge): 0.256ms

```bash
# benchmark
@fastify/deepmerge x 605,343 ops/sec ±0.87% (96 runs sampled)
deepmerge x 20,312 ops/sec ±1.06% (92 runs sampled)
merge-deep x 83,167 ops/sec ±1.30% (94 runs sampled)
ts-deepmerge x 175,977 ops/sec ±0.57% (96 runs sampled)
deepmerge-ts x 174,973 ops/sec ±0.44% (93 runs sampled)
lodash.merge x 89,213 ops/sec ±0.70% (98 runs sampled)
```
