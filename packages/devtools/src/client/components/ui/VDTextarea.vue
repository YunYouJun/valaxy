<script setup lang="ts">
defineProps<{
  rows?: number
  placeholder?: string
  autoResize?: boolean
}>()

const modelValue = defineModel<string>()
</script>

<template>
  <textarea
    v-model="modelValue"
    :rows="rows || 3"
    :placeholder="placeholder"
    class="vd-textarea w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md text-xs px-2 py-1.5 outline-none transition-colors duration-150"
    style="

--un-ring-color: rgb(99 102 241 / 0.4)"
  />
</template>

<style scoped>
.vd-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px var(--un-ring-color);
}
</style>
