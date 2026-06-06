---
title: 常见问题
categories:
  - dev
end: false
---

<details>

<summary>已解决</summary>

## `background-attachment: fixed` iOS 不支持 {#background-attachment-fixed-ios-不支持}

> iOS has an issue preventing background-attachment: fixed from being used with background-size: cover.
> [The Fixed Background Attachment Hack | CSS Tricks](https://css-tricks.com/the-fixed-background-attachment-hack/)

改为使用 `::before` 伪元素实现。

</details>

## JavaScript heap out of memory {#javascript-heap-out-of-memory}



SSG 构建（`valaxy build --ssg`）时，内置的 Valaxy SSG 引擎在同一进程中依次执行 client 构建、server 构建、页面渲染。构建阶段的 Vite resolved config 和插件系统会驻留内存，导致渲染阶段可用堆空间有限。

**最低内存要求：`--max-old-space-size=4096`（约 4 GB）**——引擎会在需要时自动以此堆重启。

```bash
# 复现测试
pnpm test:space        # demo/yun
pnpm test:space:docs   # docs
```

当堆限制低于 ~4 GB 时，SSG 引擎会自动以 `--max-old-space-size=4096`（以及在可用时
加上 `--expose-gc`）重启构建进程，使渲染阶段有足够余量。页面渲染默认并发数为 20
（可通过 `vite.ssgOptions.concurrency` 配置）。

如果你仍在 CI 环境中遇到 OOM，可以通过设置 `NODE_OPTIONS` 增大堆限制：

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build --ssg
```



## 合并 {#合并}

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

