<script setup lang="ts">
defineProps<{
  icon: string
}>()
</script>

<template>
  <div
    class="size-12 inline-flex-center cursor-pointer"
    text="$va-c-text"
    hover="bg-white/80 dark:bg-black/80 op-100"
    op-80
  >
    <div class="size-6" :class="icon" />
  </div>
</template>
