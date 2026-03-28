<script lang="ts" setup>
import { useThemeConfig } from '../../composables'

const themeConfig = useThemeConfig()
</script>

<template>
  <div
    class="links yun-fullscreen-menu-list flex-center lg:flex-col"
    flex="~" text="left"
    p="x-$rect-margin"
  >
    <slot />
    <YunFullscreenMenuItem
      v-for="item, i in themeConfig.pages"
      :key="i" :page="item"
    />
  </div>
</template>

<style>
/* Use CSS media query for mobile flex-wrap instead of JS isMobile to avoid hydration mismatch */
@media (width <= 768px) {
  .yun-fullscreen-menu-list {
    flex-wrap: wrap;
  }
}
</style>
