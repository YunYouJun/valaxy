<script setup lang="ts">
import { useFrontmatter, useSiteConfig } from 'valaxy'

const fm = useFrontmatter()
const siteConfig = useSiteConfig()
</script>

<template>
  <div
    v-motion
    flex="~ col h-full"
    :initial="{
      opacity: 0,
      y: 10,
    }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: {
        duration: 400,
        delay: 1200,
      },
    }"
  >
    <span
      v-if="fm.title"
      class="nav-menu-post-title text-sm font-bold flex items-center gap-1 truncate"
    >
      <div class="size-4" i-ri-article-line />
      <span> {{ fm.title }}</span>
    </span>
    <span v-else class="font-light truncate">
      {{ siteConfig.title }}
    </span>
  </div>
</template>

<style lang="scss">
.nav-menu-post-title {
  animation: nav-menu-title-appear 0.3s linear forwards;
  animation-timeline: scroll();
  animation-range: 0 calc(30vh);
}

@keyframes nav-menu-title-appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
