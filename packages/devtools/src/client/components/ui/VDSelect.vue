<script setup lang="ts">
import FormSelect from '@antfu/design/components/Form/FormSelect.vue'

defineProps<{
  options: { label: string, value: string }[]
  placeholder?: string
  disabled?: boolean
}>()

const modelValue = defineModel<string>()
</script>

<template>
  <FormSelect v-model="modelValue" :options="options" :placeholder="placeholder" :disabled="disabled" class="h-7! min-w-24!" />
</template>
