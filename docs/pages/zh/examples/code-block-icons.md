---
title: 代码块图标
toc: true
categories:
  - examples
---

代码块图标基于 [vitepress-plugin-group-icons](https://github.com/yuyinws/vitepress-plugin-group-icons) 实现。
另请参阅 [内置图标列表](https://vp.yuy1n.io/features.html#built-in-icons)。

## 内置图标

许多常见文件类型已内置图标支持。只需在语言标识符后使用 `[文件名]` 语法：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({})
```

```vue [App.vue]
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">
    Count: {{ count }}
  </button>
</template>
```

```json [package.json]
{
  "name": "my-valaxy-blog",
  "version": "0.1.0"
}
```

```yaml [docker-compose.yml]
version: '3'
services:
  app:
    image: node:20
```

```bash [install.sh]
#!/bin/bash
pnpm install
pnpm build
```

## 自定义图标

你可以在 `valaxy.config.ts` 中配置自定义图标：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { localIconLoader } from 'vitepress-plugin-group-icons'

export default defineValaxyConfig({
  groupIcons: {
    customIcon: {
      // 使用本地 SVG 文件
      valaxy: localIconLoader(import.meta.url, './public/favicon.svg'),
      // 使用 iconify 图标
      nodejs: 'vscode-icons:file-type-node',
      playwright: 'vscode-icons:file-type-playwright',
      typedoc: 'vscode-icons:file-type-typedoc',
      eslint: 'vscode-icons:file-type-eslint',
      dockerfile: 'vscode-icons:file-type-docker',
    },
  },
})
```

## 代码组中的图标

你也可以在代码组中使用图标：

::: code-group

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  theme: 'yun',
})
```

```json [package.json]
{
  "dependencies": {
    "valaxy": "latest",
    "valaxy-theme-yun": "latest"
  }
}
```

```toml [netlify.toml]
[build]
  command = "pnpm build"
  publish = "dist"
```

:::
