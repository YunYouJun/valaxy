<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'

const fm = useFrontmatter()

/**
 * When frontmatter.sidebar is explicitly set, use it directly.
 * Otherwise, default to CSS-controlled responsive visibility (lg breakpoint)
 * to avoid hydration mismatch from JS-based screen size detection.
 */
const sidebarExplicit = computed(() => {
  if (typeof fm.value.sidebar !== 'undefined')
    return fm.value.sidebar
  return undefined
})
</script>

<template>
  <div
    v-if="sidebarExplicit !== false"
    flex="~ col"
    class="yun-layout-left gap-4 sticky top-$yun-margin-top w-80"
    :class="{ 'yun-layout-left--responsive': sidebarExplicit === undefined }"
  >
    <slot>
      <YunSidebarCard />
      <YunAdBoard />
    </slot>
  </div>
</template>

<style>
/* When no explicit sidebar setting, use CSS media query for responsive visibility */
.yun-layout-left--responsive {
  display: none;
}

@media (min-width: 1024px) {
  .yun-layout-left--responsive {
    display: flex;
  }
}
</style>
