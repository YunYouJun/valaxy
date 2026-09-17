<script setup lang="ts">
import FormCheckbox from '@antfu/design/components/Form/FormCheckbox.vue'

defineProps<{
  disabled?: boolean
}>()

const modelValue = defineModel<boolean>()
</script>

<template>
  <FormCheckbox v-model="modelValue" :disabled="disabled" />
</template>
