<script setup lang="ts">
defineProps<{
  icon: string
  to?: string
}>()
</script>

<template>
  <AppLink
    class="size-12 inline-flex-center cursor-pointer z-$yun-z-nav-menu text-$va-c-text"
    hover="bg-white/80 dark:bg-black/80 op-100"
    op-80
    :to="to"
  >
    <div class="size-6" :class="icon" />
  </AppLink>
</template>
