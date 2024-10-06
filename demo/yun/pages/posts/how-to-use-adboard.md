---
title: 如何使用广告板？
---

## 自定义广告板

- 在你的 Valaxy 博客目录下，新建 `components/YunAdBoard.vue` 组件
- 自由地自定义你的广告板样式与内容吧

```vue
<script setup lang="ts">
// 广告板
</script>

<template>
  <YunCard>
    <RouterLink to="/posts/how-to-use-adboard">
      如何使用广告板？
    </RouterLink>
  </YunCard>
</template>
```
