<script setup lang="ts">
import coverComponents from 'virtual:valaxy-cover-components'
import { computed, onErrorCaptured, shallowRef, watch } from 'vue'
import { withBase } from '../utils/path'

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  component?: string
  componentProps?: Record<string, unknown>
  context?: 'card' | 'page'
}>(), { alt: '', context: 'page' })

const failed = shallowRef(false)
const coverComponent = computed(() => props.component && coverComponents.get(props.component))
const imageSrc = computed(() => props.src ? withBase(props.src) : undefined)
const diagnostic = computed(() => {
  if (!import.meta.env.DEV || !props.component)
    return ''
  if (!coverComponent.value)
    return `[valaxy:cover] Unknown component "${props.component}". Check its filename in components/covers/.`
  if (failed.value)
    return `[valaxy:cover] Component "${props.component}" failed to load or render. See the console for details.`
  return ''
})

watch(diagnostic, (message) => {
  if (message)
    console.warn(message)
}, { immediate: true })

watch([() => props.component, () => props.componentProps], () => {
  failed.value = false
})
onErrorCaptured((error) => {
  // Keep the static image visible if a custom component fails to load or render.
  failed.value = true
  if (import.meta.env.DEV)
    console.warn(`[valaxy:cover] Error in "${props.component}":`, error)
  return false
})
</script>

<template>
  <div v-if="src || coverComponent || diagnostic" class="valaxy-cover">
    <img
      v-if="imageSrc" :src="imageSrc" :alt="alt" class="valaxy-cover-image"
      width="640" height="360" loading="lazy"
    >
    <div v-if="coverComponent && !failed" class="valaxy-cover-content">
      <component
        :is="coverComponent" v-bind="componentProps" :src="src" :context="context"
      />
    </div>
    <p v-if="diagnostic" class="valaxy-cover-diagnostic" role="status">
      {{ diagnostic }}
    </p>
  </div>
</template>

<style scoped>
.valaxy-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.valaxy-cover-image,
.valaxy-cover-content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.valaxy-cover-image {
  object-fit: cover;
}

.valaxy-cover-diagnostic {
  position: absolute;
  inset: auto 0 0;
  z-index: 3;
  margin: 0;
  padding: 0.75rem;
  color: #fff;
  background: #78251c;
  font: 0.8rem/1.5 monospace;
  overflow-wrap: anywhere;
}
</style>
