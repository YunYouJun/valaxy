<script setup lang="ts">
defineProps<{
  tag?: string
}>()
</script>

<template>
  <component
    :is="tag || 'button'"
    class="bg-white dark:bg-gray-900 inline-flex justify-center items-center size-8 hover:bg-gray-200 dark:hover:bg-gray-800"
  >
    <slot />
  </component>
</template>
