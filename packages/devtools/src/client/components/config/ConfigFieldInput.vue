<script setup lang="ts">
import { ref, watch } from 'vue'
import { saveConfigField } from '../../stores/config'

const props = defineProps<{
  configType: 'site' | 'valaxy' | 'theme'
  field: string
  label: string
  description?: string
  placeholder?: string
  modelValue?: string
}>()

const emit = defineEmits<{
  saved: []
}>()

const localValue = ref(props.modelValue ?? '')

watch(() => props.modelValue, (v) => {
  localValue.value = v ?? ''
})

async function save() {
  if (localValue.value === (props.modelValue ?? ''))
    return
  await saveConfigField(props.configType, props.field, localValue.value)
  emit('saved')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter')
    save()
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
    <VDInput
      v-model="localValue"
      :placeholder="placeholder"
      size="md"
      @blur="save"
      @keydown="onKeydown"
    />
  </div>
</template>
