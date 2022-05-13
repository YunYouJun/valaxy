---
title: FAQ
title_zh: 常见问题
layout: docs
categories:
  - Docs
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
