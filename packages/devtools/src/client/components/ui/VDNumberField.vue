<script setup lang="ts">
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from 'reka-ui'

defineProps<{
  min?: number
  max?: number
  step?: number
}>()

const modelValue = defineModel<number>()
</script>

<template>
  <NumberFieldRoot
    v-model="modelValue"
    :min="min"
    :max="max"
    :step="step || 1"
    class="inline-flex items-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
  >
    <NumberFieldDecrement
      class="inline-flex items-center justify-center w-6 h-6 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <div class="i-ri:subtract-line" />
    </NumberFieldDecrement>
    <NumberFieldInput
      class="w-12 text-center text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-x border-gray-200 dark:border-gray-700 outline-none py-1"
    />
    <NumberFieldIncrement
      class="inline-flex items-center justify-center w-6 h-6 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <div class="i-ri:add-line" />
    </NumberFieldIncrement>
  </NumberFieldRoot>
</template>
