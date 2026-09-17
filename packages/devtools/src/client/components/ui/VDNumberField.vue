<script setup lang="ts">
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from 'reka-ui'

defineOptions({ inheritAttrs: false })

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
    :class="$attrs.class"
    class="inline-flex items-center border border-base rounded bg-raised overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/40"
  >
    <NumberFieldDecrement
      class="inline-flex items-center justify-center w-6 h-6 text-xs color-muted hover:bg-hover cursor-pointer transition-colors"
    >
      <div class="i-ri:subtract-line" />
    </NumberFieldDecrement>
    <NumberFieldInput
      v-bind="{ ...$attrs, class: undefined }"
      class="w-12 text-center text-xs bg-base color-base border-x border-base outline-none py-1"
    />
    <NumberFieldIncrement
      class="inline-flex items-center justify-center w-6 h-6 text-xs color-muted hover:bg-hover cursor-pointer transition-colors"
    >
      <div class="i-ri:add-line" />
    </NumberFieldIncrement>
  </NumberFieldRoot>
</template>
