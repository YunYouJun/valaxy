<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import { compile } from 'vue/dist/vue.esm-bundler.js'

const props = withDefaults(defineProps<{
  templateStr: string
  data?: Record<string, any>
}>(), { data: () => ({}) })
const emit = defineEmits<{ rendered: [] }>()

// The full Vue entry shares runtime-dom with the app and provides Vue's own
// compiler cache and runtime render-function registration. Only this lazy
// module imports it; ordinary pages keep using the runtime-only Vue entry.
const compiledRender = computed(() => props.templateStr ? compile(props.templateStr) : null)
const dynamicComponent = computed(() => {
  const render = compiledRender.value
  const data = { ...props.data }
  return render ? defineComponent({ data: () => ({ ...data }), render }) : null
})
</script>

<template>
  <div v-if="dynamicComponent">
    <component :is="dynamicComponent" @vue:mounted="emit('rendered')" />
  </div>
</template>
