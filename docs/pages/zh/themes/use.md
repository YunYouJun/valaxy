---
title: 使用主题
categories:
  - theme
top: 100
---

## 安装主题 {#install-theme}

```bash
npm i valaxy-theme-yun
# pnpm add valaxy-theme-yun
```

## 启用主题 {#enable-theme}

配置 `theme` 字段为主题名称，如 `yun`。


```ts [valaxy.config.ts]
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'yun'
})
```

## 主题配置 {#theme-config}

参见对应主题文档，配置 `themeConfig`。


> [主题 Yun 配置](/zh/themes/yun)

```ts [valaxy.config.ts]
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'yun',
  themeConfig: {
    // ...
  }
})
```

