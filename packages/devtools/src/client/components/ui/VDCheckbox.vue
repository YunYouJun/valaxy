<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'

defineProps<{
  disabled?: boolean
}>()

const modelValue = defineModel<boolean>()
</script>

<template>
  <CheckboxRoot
    v-model="modelValue"
    :disabled="disabled"
    class="vd-checkbox inline-flex items-center justify-center w-4 h-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 transition-colors duration-150 cursor-pointer"
    :class="[
      modelValue ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-600 dark:border-indigo-600' : '',
      disabled ? 'op-50 cursor-not-allowed' : '',
    ]"
  >
    <CheckboxIndicator class="text-white flex items-center justify-center">
      <div class="i-ri:check-line text-xs" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
