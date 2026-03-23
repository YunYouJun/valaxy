<script setup lang="ts">
defineProps<{
  title: string
  icon?: string
}>()
</script>

<template>
  <div class="config-field-group">
    <div class="flex items-center gap-2 mb-3">
      <div v-if="icon" :class="icon" class="text-base text-indigo-500" />
      <h4 class="text-sm font-bold text-gray-700 dark:text-gray-200">
        {{ title }}
      </h4>
    </div>
    <div class="flex flex-col gap-4 pl-1">
      <slot />
    </div>
  </div>
</template>
