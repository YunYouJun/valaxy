<script setup lang="ts">
import { ref, watch } from 'vue'
import { saveConfigField } from '../../stores/config'

const props = defineProps<{
  configType: 'site' | 'valaxy' | 'theme'
  field: string
  label: string
  description?: string
  modelValue?: number
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits<{
  saved: []
}>()

const localValue = ref(props.modelValue ?? 0)

watch(() => props.modelValue, (v) => {
  localValue.value = v ?? 0
})

async function save() {
  if (localValue.value === (props.modelValue ?? 0))
    return
  await saveConfigField(props.configType, props.field, localValue.value)
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
    <VDNumberField
      v-model="localValue"
      :min="min"
      :max="max"
      :step="step"
      @update:model-value="save"
    />
  </div>
</template>
