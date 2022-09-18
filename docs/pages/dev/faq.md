---
title: FAQ
title_zh: 常见问题
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

## vite-plugin-inspect 锁定为 0.6.0

> 0.7.0 之后，Break Change，要求 Vite@3.1

## Vite3 打包卡住

> 原因未知，猜测与 pnpm monorepo node_modules transforming 过多有关
