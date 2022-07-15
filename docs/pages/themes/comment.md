---
title: Implement Comments
title_zh: 实现评论
end: false
categories:
  - Theme
---

作为博客，用户通常会有评论的需求。

而由于评论系统各不相同，如 Hexo 等主题开发者们通常需在主题侧重复实现多款评论系统。
这显然是繁琐的。

Valaxy 决定中心化地提供各类封装好的评论钩子函数。

譬如主题开发者，可以快速通过 `useWaline` 来实现 [Waline](https://waline.js.org/) 评论系统的集成。  
而用户则可以使用相同的配置穿梭漫游于不同的主题之间。

```vue {2}
<script lang="ts" setup>
import { useConfig, useWaline } from 'valaxy'

// 读取用户配置
const config = useConfig()
// 挂载 Waline
useWaline(config.value.comment.waline)
</script>

<template>
  <!-- waline html 挂载点，将其写入布局中 -->
  <div id="waline" w="full" />
</template>

<style lang="scss">
// 可以在此处覆盖 waline 样式
#waline {
  --waline-theme-color: var(--va-c-primary);
}
</style>
```
