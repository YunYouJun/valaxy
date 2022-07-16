---
title: Use Theme
title_zh: 使用主题
categories:
  - Theme
---

## 安装主题

```bash
npm i valaxy-theme-yun
# pnpm add valaxy-theme-yun
```

## 启用主题

配置 `theme` 字段为主题名称，如 `yun`。

```ts
// site.config.ts
import { defineSite } from 'valaxy'
export default defineSite({
  theme: 'yun'
})
```

## 主题配置

参见对应主题文档，配置 `themeConfig`。

```ts
// site.config.ts
import { defineSite } from 'valaxy'
export default defineSite({
  theme: 'yun',
  themeConfig: {
    // ...
  }
})
```
