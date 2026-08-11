<script setup lang="ts">
import type { GirlsLayoutProps } from '../../types'
import { computed, toRef } from 'vue'
import { getGirlKey, useProgressiveCount } from '../../client'
import ValaxyGirlCard from '../ValaxyGirlCard.vue'
import ValaxyGirlsRevealTrigger from './ValaxyGirlsRevealTrigger.vue'

const props = defineProps<GirlsLayoutProps>()

defineEmits<{
  select: [index: number]
}>()

const total = computed(() => props.girls.length)
const {
  nextBatchCount,
  remainingCount,
  showMore,
  visibleCount,
} = useProgressiveCount(total, toRef(props, 'initialCount'), toRef(props, 'batchSize'))
const visibleGirls = computed(() => props.renderMode === 'all'
  ? props.girls
  : props.girls.slice(0, visibleCount.value))
</script>

<template>
  <div class="valaxy-girls-grid-wrap">
    <ol class="valaxy-girls-grid">
      <ValaxyGirlCard
        v-for="(girl, index) in visibleGirls"
        :key="getGirlKey(girl, index)"
        :girl="girl"
        :index="index"
        :reason-mode="reasonMode"
      />
    </ol>

    <ValaxyGirlsRevealTrigger
      v-if="renderMode === 'progressive' && remainingCount"
      :auto="autoLoad"
      :count="nextBatchCount"
      :remaining="remainingCount"
      @reveal="showMore"
    />
  </div>
</template>

<style scoped>
.valaxy-girls-grid-wrap {
  display: grid;
  justify-items: center;
  gap: 1rem;
}

.valaxy-girls-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: clamp(0.6rem, 1.5vw, 0.75rem);
  justify-content: start;
  margin: 0;
  padding: 0;
}

@media (width <= 40rem) {
  .valaxy-girls-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 22rem) {
  .valaxy-girls-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
