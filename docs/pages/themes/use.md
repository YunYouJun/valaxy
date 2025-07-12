---
title: Use Theme
title_zh: 使用主题
categories:
  - theme
top: 100
---

## 安装主题 {lang="zh-CN"}
## Install Theme {lang="en"}

```bash
npm i valaxy-theme-yun
# pnpm add valaxy-theme-yun
```

## 启用主题 {lang="zh-CN"}
## Enable Theme {lang="en"}

::: zh-CN
配置 `theme` 字段为主题名称，如 `yun`。
:::

::: en
Configure the `theme` field as the theme name, such as `yun`.
:::

```ts [valaxy.config.ts]
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'yun'
})
```

## 主题配置 {lang="zh-CN"}
## Theme Config {lang="en"}

::: zh-CN
参见对应主题文档，配置 `themeConfig`。
:::

::: en
Refer to the corresponding theme documentation, configure `themeConfig`.
:::

> [valaxy-theme-yun](https://github.com/YunYouJun/valaxy/blob/main/packages/valaxy-theme-yun/docs/README.md)

```ts [valaxy.config.ts]
import { defineConfig } from 'valaxy'

export default defineConfig({
  theme: 'yun',
  themeConfig: {
    // ...
  }
})
```
