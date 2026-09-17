<script setup lang="ts">
import { ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })
defineProps<{
  placeholder?: string
  size?: 'sm' | 'md'
  type?: string
  list?: string
  disabled?: boolean
}>()

const modelValue = defineModel<string | number>()
const attrs = useAttrs()
const input = ref<HTMLInputElement>()
defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div
    :class="[attrs.class, size === 'md' ? 'h-9' : 'h-7', { op50: disabled }]"
    :style="attrs.style"
    class="px-2 border border-base rounded bg-raised inline-flex gap-1.5 items-center min-w-0 transition focus-within:ring-2 focus-within:ring-primary-500/40"
  >
    <span v-if="$slots.prefix" class="color-muted text-xs shrink-0"><slot name="prefix" /></span>
    <input
      ref="input"
      v-bind="{ ...attrs, class: undefined, style: undefined }"
      v-model="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :aria-label="typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : placeholder"
      :list="list"
      :disabled="disabled"
      class="color-base text-sm outline-none bg-transparent flex-1 min-w-0 w-full placeholder:color-faint"
    >
    <span v-if="$slots.suffix" class="color-muted text-xs shrink-0"><slot name="suffix" /></span>
  </div>
</template>
