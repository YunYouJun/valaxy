<script setup lang="ts">
import type { ThemeableImage } from '../types'
import { withBase } from 'valaxy'

defineOptions({ inheritAttrs: false })

defineProps<{
  image: ThemeableImage
  alt?: string
}>()
</script>

<template>
  <template v-if="image">
    <img
      v-if="typeof image === 'string' || 'src' in image"
      v-bind="typeof image === 'string' ? $attrs : { ...image, ...$attrs }"
      :src="withBase(typeof image === 'string' ? image : image.src)"
      :alt="alt ?? (typeof image === 'string' ? '' : image.alt || '')"
    >
    <template v-else>
      <PressImage
        class="dark"
        :image="image.dark"
        :alt="image.alt"
        v-bind="$attrs"
      />
      <PressImage
        class="light"
        :image="image.light"
        :alt="image.alt"
        v-bind="$attrs"
      />
    </template>
  </template>
</template>

<style scoped>
html:not(.dark) img.dark {
  display: none;
}

.dark img.light {
  display: none;
}
</style>
