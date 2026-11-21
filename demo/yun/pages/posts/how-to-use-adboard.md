---
title: 如何使用广告板？
---

## 自定义广告板

- 在你的 Valaxy 博客目录下，新建 `components/YunAdBoard.vue` 组件
- 推荐使用主题内置的 `<YunAdBoardCard>` 容器，开箱即用地保持与侧栏卡片一致的排版与暗色模式样式；也可以直接编写完全自定义的模板内容

```vue
<script setup lang="ts">
// 广告板
</script>

<template>
  <YunAdBoardCard title="如何使用广告板？" to="/posts/how-to-use-adboard">
    <p>欢迎加入 Valaxy 社区交流群</p>
    <p>QQ 群 <code>1050458482</code></p>
  </YunAdBoardCard>
</template>
```

### `YunAdBoardCard` 属性与插槽

- `title`：卡片标题文本
- `to` / `href`：为标题附加站内路由或外部链接（外链会自动附加 `rel="noopener noreferrer"`）
- `icon`：标题图标类名，默认 `i-ri-megaphone-line`，传入 `:icon="false"` 可隐藏图标
- `badge`：右上角或标题旁的轻量角标（如 `'AD'`、`'推荐'`）
- `align`：对齐方式，支持 `'center'`（默认）或 `'start'`
- `flush`：传入 `true` 时移除内边距，适合整张横幅图片展示
- 插槽：`header`、默认内容插槽、`footer`
