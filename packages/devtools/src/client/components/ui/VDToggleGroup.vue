<script setup lang="ts">
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'

defineProps<{
  options: { icon?: string, label?: string, value: string }[]
}>()

const modelValue = defineModel<string>()
</script>

<template>
  <ToggleGroupRoot
    v-model="modelValue"
    type="single"
    class="inline-flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden"
  >
    <ToggleGroupItem
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      class="inline-flex items-center justify-center gap-1 px-2 py-1 text-xs cursor-pointer transition-colors duration-150 outline-none border-r border-gray-200 dark:border-gray-700 last:border-r-0 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=on]:bg-indigo-50 data-[state=on]:text-indigo-600 dark:data-[state=on]:bg-indigo-900/30 dark:data-[state=on]:text-indigo-400"
    >
      <div v-if="opt.icon" :class="opt.icon" class="text-sm" />
      <span v-if="opt.label">{{ opt.label }}</span>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
