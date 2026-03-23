<script setup lang="ts">
defineProps<{
  tag?: string
}>()
</script>

<template>
  <component
    :is="tag || 'button'"
    class="bg-gray-50 dark:bg-dark-800 inline-flex justify-center items-center size-8 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
  >
    <slot />
  </component>
</template>
