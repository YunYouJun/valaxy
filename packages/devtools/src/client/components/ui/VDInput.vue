<script setup lang="ts">
import { useSlots } from 'vue'

defineProps<{
  placeholder?: string
  size?: 'sm' | 'md'
  type?: string
  list?: string
  disabled?: boolean
}>()

const modelValue = defineModel<string | number>()
const slots = useSlots()
</script>

<template>
  <div
    v-if="slots.suffix || slots.prefix"
    class="vd-input-wrapper flex items-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md transition-colors duration-150"
    :class="[
      disabled ? 'op-50 cursor-not-allowed' : '',
    ]"
    style="--un-ring-color: rgba(99, 102, 241, 0.4)"
  >
    <span
      v-if="slots.prefix"
      class="text-gray-400 dark:text-gray-500 select-none shrink-0 pl-2"
      :class="[
        size === 'sm' || !size ? 'text-xs' : 'text-sm',
      ]"
    >
      <slot name="prefix" />
    </span>
    <input
      v-model="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :list="list"
      :disabled="disabled"
      class="flex-1 min-w-0 bg-transparent text-gray-700 dark:text-gray-200 outline-none"
      :class="[
        size === 'sm' || !size
          ? `text-xs py-1 ${slots.prefix ? 'pl-0.5' : 'pl-2'} ${slots.suffix ? 'pr-0.5' : 'pr-2'}`
          : `text-sm py-1.5 ${slots.prefix ? 'pl-0.5' : 'pl-2.5'} ${slots.suffix ? 'pr-0.5' : 'pr-2.5'}`,
      ]"
    >
    <span
      v-if="slots.suffix"
      class="text-gray-400 dark:text-gray-500 select-none shrink-0 pr-2"
      :class="[
        size === 'sm' || !size ? 'text-xs' : 'text-sm',
      ]"
    >
      <slot name="suffix" />
    </span>
  </div>
  <input
    v-else
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

.vd-input-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px var(--un-ring-color);
}
</style>
