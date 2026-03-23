<script setup lang="ts">
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'

defineProps<{
  options: { label: string, value: string }[]
  placeholder?: string
}>()

const modelValue = defineModel<string>()
</script>

<template>
  <SelectRoot v-model="modelValue">
    <SelectTrigger
      class="vd-select inline-flex items-center justify-between gap-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md text-xs px-2 py-1 cursor-pointer outline-none transition-colors duration-150 min-w-24"
    >
      <SelectValue :placeholder="placeholder || 'Select...'" />
      <div class="i-ri:arrow-down-s-line text-xs op-50" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
        position="popper"
        :side-offset="4"
      >
        <SelectViewport class="p-1">
          <SelectItem
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
            class="flex items-center px-2 py-1.5 text-xs rounded cursor-pointer outline-none text-gray-700 dark:text-gray-200 data-[highlighted]:bg-indigo-50 dark:data-[highlighted]:bg-indigo-900/30 data-[highlighted]:text-indigo-600 dark:data-[highlighted]:text-indigo-400"
          >
            <SelectItemText>{{ opt.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
