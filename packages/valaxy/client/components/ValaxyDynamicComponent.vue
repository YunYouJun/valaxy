<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

defineProps<{
  templateStr: string
  data?: Record<string, any>
}>()
const emit = defineEmits<{ rendered: [] }>()

// Vue's async component boundary also preserves server-rendered content while
// the compiler loads during hydration, without requiring a parent Suspense.
const ValaxyRuntimeTemplate = defineAsyncComponent(() => import('../runtime/ValaxyRuntimeTemplate.vue'))
</script>

<template>
  <ValaxyRuntimeTemplate
    v-if="templateStr" :template-str="templateStr" :data="data"
    @rendered="emit('rendered')"
  />
</template>
