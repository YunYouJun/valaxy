---
title: FAQ
categories:
  - dev
end: false
---

<details>

<summary>Resolved</summary>

## `background-attachment: fixed` not supported on iOS

> iOS has an issue preventing background-attachment: fixed from being used with background-size: cover.
> [The Fixed Background Attachment Hack | CSS Tricks](https://css-tricks.com/the-fixed-background-attachment-hack/)

Use `::before` pseudo-element instead.

</details>


## JavaScript heap out of memory

SSG builds the client bundle, server bundle, and HTML pages in one process. It respects Node's default heap and explicit `NODE_OPTIONS` limits; it does not raise them automatically.

A heap limit covers only V8-managed memory. Native bundler allocations, buffers, child processes, and the container's file cache also consume memory. Setting a 4 GiB heap does **not** make a build fit in a 4 GiB container. Start with a smaller heap and measure the complete build:

```bash
NODE_OPTIONS=--max-old-space-size=1536 pnpm build --ssg
```

If V8 reports `JavaScript heap out of memory`, increase the heap only when the host has room. If the container kills the process, reduce total memory use or increase the container budget. Rendering concurrency can be configured with `vite.ssgOptions.concurrency` (default `20`).

The documentation memory workflow verifies cold and warm builds, including the full API reference, with a hard 4 GiB container limit, no swap, and a 1.5 GiB heap. This is a regression check for this site's current content and dependencies; larger sites should measure their own requirements.

```bash
pnpm test:space        # demo/yun with a 2304 MiB heap
pnpm test:space:docs   # docs with a 1536 MiB heap
```


## Merge

Use `defu`.

Testing shows `defu` is faster than `@fastify/deepmerge`.

Merging a single config:

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
