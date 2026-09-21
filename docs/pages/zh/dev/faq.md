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

SSG 在同一进程中完成客户端打包、服务端打包和 HTML 页面渲染。引擎遵守 Node 默认堆和显式 `NODE_OPTIONS` 限制，不再自动提高限制。

堆上限只覆盖 V8 管理的内存。打包器原生内存、缓冲区、子进程和容器文件缓存也会占用内存。将堆设为 4 GiB，**不代表**构建能放进 4 GiB 容器。应先留出余量，再实测完整构建：

```bash
NODE_OPTIONS=--max-old-space-size=1536 pnpm build --ssg
```

如果 V8 报 `JavaScript heap out of memory`，只有在宿主内存有余量时才提高堆限制。如果是容器杀死进程，应降低总内存占用或增加容器预算。页面渲染并发可通过 `vite.ssgOptions.concurrency` 配置，默认 `20`。

文档内存工作流会在 4 GiB 硬上限、无 swap、1.5 GiB 堆的容器中验证冷构建和暖构建，保留完整 API 文档。该检查覆盖本站当前内容和依赖；更大的站点应单独测量需求。

```bash
pnpm test:space        # demo/yun，堆上限 2304 MiB
pnpm test:space:docs   # docs，堆上限 1536 MiB
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

