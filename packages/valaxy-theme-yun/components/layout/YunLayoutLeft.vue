<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'

const fm = useFrontmatter()

/**
 * When frontmatter.sidebar is explicitly set to false, the sidebar is not rendered.
 * Otherwise, CSS media query controls visibility (hidden on mobile, shown on lg+).
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
    class="yun-layout-left gap-4 sticky top-$yun-margin-top w-80"
  >
    <slot>
      <YunSidebarCard />
      <YunAdBoard />
    </slot>
  </div>
</template>

<style>
/* Hide left sidebar on screens smaller than lg (1024px) to prevent
   side-by-side layout with yun-main on narrow/mobile screens.
   Mobile users use the hamburger menu instead. */
.yun-layout-left {
  display: none;
}

@media (width >= 1024px) {
  .yun-layout-left {
    display: flex;
    flex-direction: column;
  }
}
</style>
