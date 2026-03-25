---
title: Code Block Icons
toc: true
categories:
  - examples
---

Code block icons are implemented based on [vitepress-plugin-group-icons](https://github.com/yuyinws/vitepress-plugin-group-icons). See also the [built-in icons list](https://vp.yuy1n.io/features.html#built-in-icons).

## Built-in Icons

Many common file types have built-in icon support. Simply use the `[filename]` syntax after the language identifier:

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

## Custom Icons

You can configure custom icons in `valaxy.config.ts`:

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { localIconLoader } from 'vitepress-plugin-group-icons'

export default defineValaxyConfig({
  groupIcons: {
    customIcon: {
      // Use a local SVG file
      valaxy: localIconLoader(import.meta.url, './public/favicon.svg'),
      // Use iconify icons
      nodejs: 'vscode-icons:file-type-node',
      playwright: 'vscode-icons:file-type-playwright',
      typedoc: 'vscode-icons:file-type-typedoc',
      eslint: 'vscode-icons:file-type-eslint',
      dockerfile: 'vscode-icons:file-type-docker',
    },
  },
})
```

## Code Groups with Icons

You can also use icons inside code groups:

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
