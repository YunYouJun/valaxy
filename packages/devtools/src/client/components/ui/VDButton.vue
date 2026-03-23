<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'secondary' | 'warn' | 'ghost'
  size?: 'sm' | 'md'
  disabled?: boolean
  loading?: boolean
  icon?: string
  label?: string
  tag?: 'button' | 'a'
}>()
</script>

<template>
  <component
    :is="tag || 'button'"
    class="vd-btn inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 cursor-pointer select-none whitespace-nowrap"
    :class="[
      // Size
      size === 'sm' || !size
        ? 'text-xs px-2 py-1 rounded-md'
        : 'text-sm px-3 py-1.5 rounded-md',

      // Variant
      variant === 'secondary'
        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
        : variant === 'warn'
          ? 'bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500'
          : variant === 'ghost'
            ? 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            : 'bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500',

      // State
      (disabled || loading) ? 'op-50 pointer-events-none' : '',
    ]"
    :disabled="disabled || loading"
  >
    <div v-if="loading" class="i-ri:loader-4-line animate-spin text-sm" />
    <div v-else-if="icon" :class="icon" class="text-sm" />
    <span v-if="label || $slots.default">
      <slot>{{ label }}</slot>
    </span>
  </component>
</template>
