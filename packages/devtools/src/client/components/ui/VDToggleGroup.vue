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
    class="inline-flex rounded-md border border-base overflow-hidden"
  >
    <ToggleGroupItem
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      class="inline-flex items-center justify-center gap-1 px-2 py-1 text-xs cursor-pointer transition-colors duration-150 outline-none border-r border-base last:border-r-0 color-muted hover:bg-hover data-[state=on]:bg-active data-[state=on]:color-active"
    >
      <div v-if="opt.icon" :class="opt.icon" class="text-sm" />
      <span v-if="opt.label">{{ opt.label }}</span>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
