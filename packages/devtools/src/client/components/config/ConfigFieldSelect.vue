<script setup lang="ts">
import { saveConfigField } from '../../stores/config'

const props = defineProps<{
  configType: 'site' | 'valaxy' | 'theme'
  field: string
  label: string
  description?: string
  modelValue?: string
  options: { label: string, value: string }[]
}>()

const emit = defineEmits<{
  saved: []
}>()

async function onSelect(value: string) {
  if (value === props.modelValue)
    return
  await saveConfigField(props.configType, props.field, value)
  emit('saved')
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-center gap-1.5">
      <label class="text-sm font-medium">{{ label }}</label>
      <VDTooltip v-if="description" :content="description" side="right">
        <div class="i-ri:information-line text-xs op-40 cursor-help" />
      </VDTooltip>
    </div>
    <VDSelect
      :model-value="modelValue"
      :options="options"
      class="w-48"
      @update:model-value="onSelect"
    />
  </div>
</template>
