<script setup lang="ts">
defineProps<{
  placeholder?: string
  size?: 'sm' | 'md'
  type?: string
  list?: string
  disabled?: boolean
}>()

const modelValue = defineModel<string | number>()
</script>

<template>
  <input
    v-model="modelValue"
    :type="type || 'text'"
    :placeholder="placeholder"
    :list="list"
    :disabled="disabled"
    class="vd-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md transition-colors duration-150 outline-none"
    :class="[
      size === 'sm' || !size
        ? 'text-xs px-2 py-1'
        : 'text-sm px-2.5 py-1.5',
      disabled ? 'op-50 cursor-not-allowed' : '',
    ]"
    style="--un-ring-color: rgba(99, 102, 241, 0.4)"
  >
</template>

<style scoped>
.vd-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px var(--un-ring-color);
}
</style>
