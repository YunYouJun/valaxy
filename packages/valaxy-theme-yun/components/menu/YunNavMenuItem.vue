<script setup lang="ts">
defineProps<{
  icon: string
  label?: string
  to?: string
}>()
</script>

<template>
  <AppLink
    class="size-12 inline-flex-center cursor-pointer z-$yun-z-nav-menu text-$va-c-text"
    hover="bg-white/80 dark:bg-black/80 op-100"
    op-80
    :to="to"
    :aria-label="label"
    :title="label"
  >
    <div class="size-6" :class="icon" aria-hidden="true" />
  </AppLink>
</template>
