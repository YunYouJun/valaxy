---
title: SSR Compatibility
categories:
  - guide
top: 2
---

## SSR Compatibility

Valaxy builds your site using SSG (Static Site Generation), which renders pages to HTML at build time via Vue's server-side rendering (SSR). This means components run in a Node.js environment during the build, where browser APIs like `window`, `document`, and `navigator` are not available.

### Why Hydration Mismatches Happen

After SSG generates static HTML, Vue "hydrates" it in the browser — attaching event listeners and making it interactive. If the HTML rendered on the server differs from what the client renders, you get a **hydration mismatch** warning.

Common causes:

| Cause | Example |
|-------|---------|
| Browser-only API in template | `{{ window.innerWidth }}` |
| Time/locale-dependent values | `{{ new Date().toLocaleString() }}` |
| Browser extensions modifying HTML | Ad blockers injecting elements |
| Non-standard HTML nesting | `<p>` inside `<p>`, `<div>` inside `<a>` |

### `<ClientOnly>`

Wrap browser-only content with the built-in `<ClientOnly>` component. Its content is only rendered on the client side.

```vue
<template>
  <ClientOnly>
    <BrowserOnlyComponent />
  </ClientOnly>
</template>
```

Use the `#fallback` slot to show placeholder content during SSR/SSG:

```vue
<template>
  <ClientOnly>
    <HeavyChart :data="chartData" />
    <template #fallback>
      <div class="chart-placeholder">
        Loading chart...
      </div>
    </template>
  </ClientOnly>
</template>
```

### `defineClientComponent`

For third-party libraries that access browser APIs at import time (not just at render time), use `defineClientComponent`. It delays the `import()` until the component mounts in the browser.

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

You can pass props and a callback:

```vue
<script setup>
import { defineClientComponent } from 'valaxy'

const EchartsChart = defineClientComponent(
  () => import('vue-echarts'),
  [
    { option: chartOption, autoresize: true }, // props
    { default: () => h('div', 'Loading...') }, // children/slots
  ],
  (mod) => {
    // called after the module is loaded
    console.log('vue-echarts loaded', mod)
  },
)
</script>

<template>
  <EchartsChart />
</template>
```

### `onMounted` + `ref` Pattern

For simple cases where you need browser APIs in logic (not in third-party imports), use Vue's `onMounted`:

```vue
<script setup>
import { onMounted, ref } from 'vue'

const screenWidth = ref(0)

onMounted(() => {
  screenWidth.value = window.innerWidth
})
</script>

<template>
  <p>Screen width: {{ screenWidth }}</p>
</template>
```

### `import.meta.env.SSR`

Use the `import.meta.env.SSR` flag (provided by Vite) to conditionally execute code:

```ts
if (!import.meta.env.SSR) {
  // This code only runs in the browser
  document.addEventListener('scroll', handleScroll)
}
```

> This is useful in composables or setup functions where you need to guard browser-only side effects.

### CSS-Based Responsive Rendering

Avoid using `v-if` with reactive viewport values for responsive layouts — this causes hydration mismatches because the server cannot know the viewport size. Use CSS instead:

```vue
<!-- Bad: causes hydration mismatch -->
<template>
  <MobileNav v-if="isMobile" />
  <DesktopNav v-else />
</template>

<!-- Good: use CSS media queries -->
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

### Tips for Theme & Addon Developers

- Always test with `pnpm demo:build` (SSG build) — `pnpm demo` (dev mode) won't catch SSR issues.
- Wrap all browser-only third-party components with `<ClientOnly>` or `defineClientComponent`.
- Never access `window`, `document`, or `navigator` at the top level of a `<script setup>` block — move it into `onMounted`.
- If a library provides a server-safe build (e.g., `import lib from 'lib/dist/ssr'`), prefer that over wrapping with `<ClientOnly>`.
- Use `import.meta.env.SSR` for conditional side effects in composables.
