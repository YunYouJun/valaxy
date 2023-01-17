<script lang="ts" setup>
import { computed } from 'vue'
import type { Feature } from '../types'

const props = defineProps<{
  features: Feature[]
}>()

const grid = computed(() => {
  const length = props.features.length
  if (length <= 3)
    return `grid-cols-1 sm:grid-cols-2 md:grid-cols-${length}`
  else
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
})
</script>

<template>
  <div class="press-features">
    <div class="m-auto container grid gap-4" p="x-4" :class="[grid]">
      <div v-for="feature in features" :key="feature.title" class="inline-grid">
        <PressFeature :feature="feature" />
      </div>
    </div>
  </div>
</template>
