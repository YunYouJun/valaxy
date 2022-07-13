---
title: FAQ
categories:
  - Guide
end: false
---

## 改变构建形式

为了 URL 兼容性，Valaxy 默认将 `xxx.md` 构建为 `/xxx/index.html`。

如果您更希望默认构建为 `xxx.html` 的形式。

可以修改 `vite-ssg` 的配置。

在用户目录下的 `vite.config.ts` 中设置：

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
  ssgOptions: {
    dirStyle: 'flat',
  }
})
```
