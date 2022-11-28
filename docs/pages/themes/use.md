---
title: Use Theme
title_zh-CN: 使用主题
categories:
  - Theme
top: 100
---

## 安装主题

```bash
npm i valaxy-theme-yun
# pnpm add valaxy-theme-yun
```

## 启用主题

配置 `theme` 字段为主题名称，如 `yun`。

```ts
// valaxy.config.ts
import { defineConfig } from 'valaxy'
export default defineConfig({
  theme: 'yun'
})
```

## 主题配置

参见对应主题文档，配置 `themeConfig`。

```ts
// valaxy.config.ts
import { defineConfig } from 'valaxy'
export default defineConfig({
  theme: 'yun',
  themeConfig: {
    // ...
  }
})
```
