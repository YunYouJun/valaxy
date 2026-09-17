<script setup lang="ts">
import FormTextarea from '@antfu/design/components/Form/FormTextarea.vue'

defineProps<{
  rows?: number
  placeholder?: string
  autoResize?: boolean
}>()

const modelValue = defineModel<string>()
</script>

<template>
  <FormTextarea v-model="modelValue" :rows="rows || 3" :placeholder="placeholder" class="text-sm" />
</template>
