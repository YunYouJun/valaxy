---
title: Core API
categories:
 - API
---

## Client

### Toggle Dark

- `isDark`: Whether dark mode is enabled
- `toggleDark`: Toggle dark mode
- `toggleDarkWithTransition`: Toggle dark mode with transition

Example:

```vue
<script lang="ts" setup>
import { isDark, toggleDarkWithTransition } from 'valaxy'
</script>

<template>
  <button class="yun-icon-btn" @click="toggleDarkWithTransition">
    <div i="ri-sun-line dark:ri-moon-line" />
  </button>
</template>
```

## Node

### Hooks

- [钩子](/guide/custom/hooks.md)
