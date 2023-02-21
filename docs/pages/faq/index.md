---
title: FAQ
title_zh-CN: 常见问题
categories:
  - Guide
end: false
---

## 改变构建形式 {lang="zh-CN"}

## Change Generated Directory Style {lang="en"}

::: zh-CN
Valaxy 默认将 `xxx.md` 构建为 `/xxx.html`。

如果您更希望默认构建为 `/xxx/index.html` 的形式。

可以修改 `vite-ssg` 的配置。

在用户目录下的 `vite.config.ts` 中设置：
:::

::: en
Valaxy builds `xxx.md` as `/xxx.html` by default.

If you prefer to build them as `/xxx/index.html`, you can modify the configuration of `vite-ssg`.

Set it in `vite.config.ts` under the user directory as follows:
:::

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
  ssgOptions: {
    dirStyle: 'nested',
  }
})
```
