---
title: SSR 兼容性
categories:
  - guide
top: 2
---

## SSR 兼容性

Valaxy 使用 SSG（静态站点生成）构建你的站点，它在构建时通过 Vue 的服务端渲染（SSR）将页面渲染为 HTML。这意味着组件在构建期间运行在 Node.js 环境中，此时像 `window`、`document` 和 `navigator` 这样的浏览器 API 是不可用的。

### 为什么会发生水合不匹配

在 SSG 生成静态 HTML 后，Vue 会在浏览器中"水合"它——附加事件监听器并使其具有交互性。如果服务器渲染的 HTML 与客户端渲染的内容不同，你会收到**水合不匹配**警告。

常见原因：

| 原因 | 示例 |
|-------|---------|
| 模板中使用仅浏览器 API | `{{ window.innerWidth }}` |
| 时间/地区相关的值 | `{{ new Date().toLocaleString() }}` |
| 浏览器扩展修改 HTML | 广告拦截器注入元素 |
| 非标准 HTML 嵌套 | `<p>` 嵌套在 `<p>` 中，`<div>` 在 `<a>` 中 |

### `<ClientOnly>`

使用内置的 `<ClientOnly>` 组件包裹仅浏览器的内容。它的内容只在客户端渲染。

```vue
<template>
  <ClientOnly>
    <BrowserOnlyComponent />
  </ClientOnly>
</template>
```

使用 `#fallback` 插槽在 SSR/SSG 期间显示占位内容：

```vue
<template>
  <ClientOnly>
    <HeavyChart :data="chartData" />
    <template #fallback>
      <div class="chart-placeholder">
        加载图表中...
      </div>
    </template>
  </ClientOnly>
</template>
```

### `defineClientComponent`

对于在导入时（而不仅仅是渲染时）访问浏览器 API 的第三方库，使用 `defineClientComponent`。它会延迟 `import()` 直到组件在浏览器中挂载。

```vue
<script setup>
import { defineClientComponent } from 'valaxy'

const MyBrowserLib = defineClientComponent(
  () => import('some-browser-only-lib')
)
</script>

<template>
  <MyBrowserLib />
</template>
```

你可以传递 props 和回调函数：

```vue
<script setup>
import { defineClientComponent } from 'valaxy'

const EchartsChart = defineClientComponent(
  () => import('vue-echarts'),
  [
    { option: chartOption, autoresize: true }, // props
    { default: () => h('div', '加载中...') }, // children/slots
  ],
  (mod) => {
    // 模块加载后调用
    console.log('vue-echarts 已加载', mod)
  },
)
</script>

<template>
  <EchartsChart />
</template>
```

### `onMounted` + `ref` 模式

对于只需要在逻辑中（而不是第三方导入中）使用浏览器 API 的简单情况，使用 Vue 的 `onMounted`：

```vue
<script setup>
import { onMounted, ref } from 'vue'

const screenWidth = ref(0)

onMounted(() => {
  screenWidth.value = window.innerWidth
})
</script>

<template>
  <p>屏幕宽度：{{ screenWidth }}</p>
</template>
```

### `import.meta.env.SSR`

使用 `import.meta.env.SSR` 标志（由 Vite 提供）来有条件地执行代码：

```ts
if (!import.meta.env.SSR) {
  // 这段代码只在浏览器中运行
  document.addEventListener('scroll', handleScroll)
}
```

> 这在 composables 或 setup 函数中保护仅浏览器的副作用时很有用。

### 基于 CSS 的响应式渲染

避免在响应式布局中使用 `v-if` 配合响应式视口值——这会导致水合不匹配，因为服务器无法知道视口大小。改用 CSS：

```vue
<!-- 不好：会导致水合不匹配 -->
<template>
  <MobileNav v-if="isMobile" />
  <DesktopNav v-else />
</template>

<!-- 好：使用 CSS 媒体查询 -->
<template>
  <MobileNav class="mobile-only" />
  <DesktopNav class="desktop-only" />
</template>

<style>
.mobile-only {
  display: block;
}
.desktop-only {
  display: none;
}
@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
  .desktop-only {
    display: block;
  }
}
</style>
```

### 主题和插件开发者提示

- 始终使用 `pnpm demo:build`（SSG 构建）进行测试——`pnpm demo`（开发模式）不会捕获 SSR 问题。
- 使用 `<ClientOnly>` 或 `defineClientComponent` 包裹所有仅浏览器的第三方组件。
- 永远不要在 `<script setup>` 块的顶层访问 `window`、`document` 或 `navigator`——将其移到 `onMounted` 中。
- 如果库提供服务端安全的构建版本（例如 `import lib from 'lib/dist/ssr'`），优先使用它而不是用 `<ClientOnly>` 包裹。
- 在 composables 中使用 `import.meta.env.SSR` 来处理条件副作用。
