<script setup lang="ts">
import type { Feature } from '../types'
import { computed } from 'vue'

const props = defineProps<{
  features: Feature[]
}>()

const columns = computed(() => {
  const count = props.features.length
  if (count === 4)
    return 2
  return count === 8 ? 4 : Math.min(count, 3)
})
</script>

<template>
  <div v-if="features.length" class="press-features" :style="{ '--pr-feature-columns': columns }">
    <div v-for="feature in features" :key="feature.title" class="press-feature-cell">
      <PressFeature :feature="feature" />
    </div>
  </div>
</template>

<style scoped>
.press-features {
  display: grid;
  grid-template-columns: repeat(var(--pr-feature-columns), minmax(0, 1fr));
  gap: 1px;
  background: var(--pr-c-divider-light);
  border-block: 1px solid var(--pr-c-divider-light);
}

.press-feature-cell {
  min-width: 0;
  background: var(--pr-c-bg);
}

@media (width <= 959px) {
  .press-features {
    grid-template-columns: repeat(min(var(--pr-feature-columns), 2), minmax(0, 1fr));
  }
}

@media (width <= 639px) {
  .press-features {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
