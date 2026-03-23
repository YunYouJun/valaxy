<script setup lang="ts">
import { saveConfigField } from '../../stores/config'

const props = defineProps<{
  configType: 'site' | 'valaxy' | 'theme'
  field: string
  label: string
  description?: string
  modelValue?: boolean
}>()

const emit = defineEmits<{
  saved: []
}>()

async function toggle() {
  const newValue = !props.modelValue
  await saveConfigField(props.configType, props.field, newValue)
  emit('saved')
}
</script>

<template>
  <div class="flex items-center gap-2">
    <VDCheckbox
      :model-value="modelValue ?? false"
      @update:model-value="toggle"
    />
    <label class="text-sm font-medium cursor-pointer" @click="toggle">{{ label }}</label>
    <VDTooltip v-if="description" :content="description" side="right">
      <div class="i-ri:information-line text-xs op-40 cursor-help" />
    </VDTooltip>
  </div>
</template>
