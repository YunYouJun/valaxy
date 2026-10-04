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

watch([() => props.component, () => props.componentProps], () => {
  failed.value = false
})
onErrorCaptured(() => {
  // Keep the static image visible if a custom component fails to load or render.
  failed.value = true
  return false
})
</script>

<template>
  <div v-if="src || coverComponent" class="valaxy-cover">
    <img
      v-if="imageSrc" :src="imageSrc" :alt="alt" class="valaxy-cover-image"
      width="640" height="360" loading="lazy"
    >
    <div v-if="coverComponent && !failed" class="valaxy-cover-content">
      <component
        :is="coverComponent" v-bind="componentProps" :src="src" :context="context"
      />
    </div>
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
</style>
