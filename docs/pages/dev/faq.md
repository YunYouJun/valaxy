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


During SSG build (`valaxy build --ssg`), the built-in Valaxy SSG engine runs client build, server build, and page rendering in the same process. The Vite resolved config and plugin system from the build phase remain in memory, leaving limited heap space for the rendering phase.

**Minimum memory requirement: `--max-old-space-size=4096` (~4 GB)** — the engine auto-respawns with this heap when needed.

```bash
# Reproduce tests
pnpm test:space        # demo/yun
pnpm test:space:docs   # docs
```

When the heap limit is below ~4 GB, the SSG engine automatically respawns the
build process with `--max-old-space-size=4096` (and `--expose-gc` when available)
so rendering has enough headroom. Page rendering runs at a default concurrency of
20 (configurable via `vite.ssgOptions.concurrency`).

If you still encounter OOM in CI environments, raise the heap limit via `NODE_OPTIONS`:

```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm build --ssg
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
