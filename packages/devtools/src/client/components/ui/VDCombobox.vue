<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import { ref, watch } from 'vue'

defineProps<{
  options: string[]
  placeholder?: string
  disabled?: boolean
}>()

const modelValue = defineModel<string>({ default: '' })

// Internal value for ComboboxRoot (passive / uncontrolled mode)
const internalValue = ref(modelValue.value)

// Sync external → internal
watch(modelValue, (val) => {
  if (val !== internalValue.value)
    internalValue.value = val
})

function onSelect(val: string) {
  internalValue.value = val
  modelValue.value = val
}

function displayValue(val: unknown): string {
  if (typeof val === 'string')
    return val
  return modelValue.value
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  modelValue.value = target.value
}
</script>

<template>
  <ComboboxRoot
    v-model="internalValue"
    :reset-search-term-on-blur="false"
    :open-on-focus="true"
    :disabled="disabled"
    class="relative"
    @update:model-value="onSelect"
  >
    <ComboboxAnchor class="inline-flex items-center w-full">
      <ComboboxInput
        :placeholder="placeholder"
        :display-value="displayValue"
        class="vd-combobox-input border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md text-xs px-2 py-1 pr-5 outline-none transition-colors duration-150 w-full"
        :class="[disabled ? 'op-50 cursor-not-allowed' : '']"
        @input="onInputChange"
      />
      <ComboboxTrigger class="absolute right-1 inline-flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
        <div class="i-ri:arrow-down-s-line text-xs" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        class="z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-48"
        position="popper"
        :side-offset="4"
      >
        <ComboboxViewport class="p-1">
          <ComboboxEmpty class="px-2 py-1.5 text-xs op-40">
            No matching keys
          </ComboboxEmpty>
          <ComboboxItem
            v-for="opt in options"
            :key="opt"
            :value="opt"
            class="flex items-center px-2 py-1.5 text-xs rounded cursor-pointer outline-none text-gray-700 dark:text-gray-200 data-[highlighted]:bg-indigo-50 dark:data-[highlighted]:bg-indigo-900/30 data-[highlighted]:text-indigo-600 dark:data-[highlighted]:text-indigo-400"
          >
            <span class="font-mono">{{ opt }}</span>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<style scoped>
.vd-combobox-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgb(99 102 241 / 0.4);
}
</style>
