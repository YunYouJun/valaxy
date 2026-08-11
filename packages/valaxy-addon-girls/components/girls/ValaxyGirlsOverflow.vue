<script setup lang="ts">
import type { GirlEntry, GirlsRenderMode } from '../../types'
import { computed, shallowRef, toRef } from 'vue'
import { getGirlKey, useProgressiveCount } from '../../client'
import ValaxyGirlOrb from './ValaxyGirlOrb.vue'
import ValaxyGirlsRevealTrigger from './ValaxyGirlsRevealTrigger.vue'

const props = withDefaults(defineProps<{
  autoLoad?: boolean
  batchSize?: number
  girls: readonly GirlEntry[]
  renderMode?: GirlsRenderMode
  selectedIndex: number
  startIndex: number
}>(), {
  autoLoad: true,
  batchSize: 24,
  renderMode: 'progressive',
})

const emit = defineEmits<{
  select: [index: number]
}>()

const isExpanded = shallowRef(false)
const total = computed(() => props.girls.length)
const {
  nextBatchCount,
  remainingCount,
  showMore,
  visibleCount,
} = useProgressiveCount(total, toRef(props, 'batchSize'), toRef(props, 'batchSize'))
const expandCount = computed(() => props.autoLoad ? nextBatchCount.value : props.girls.length)
const visibleGirls = computed(() => props.renderMode === 'all'
  ? props.girls
  : props.girls.slice(0, visibleCount.value))
</script>

<template>
  <div v-if="girls.length" class="valaxy-girls-overflow">
    <ValaxyGirlsRevealTrigger
      v-if="renderMode === 'progressive' && !isExpanded"
      :auto="autoLoad"
      :count="expandCount"
      mode="expand"
      :remaining="girls.length"
      @reveal="isExpanded = true"
    />

    <template v-else>
      <ol class="valaxy-girls-overflow-list">
        <li
          v-for="(girl, index) in visibleGirls"
          :key="getGirlKey(girl, startIndex + index)"
          class="valaxy-girls-overflow-item"
        >
          <ValaxyGirlOrb
            :girl="girl"
            :index="startIndex + index"
            :selected="startIndex + index === selectedIndex"
            :size="3.1"
            @select="emit('select', startIndex + index)"
          />
        </li>
      </ol>

      <ValaxyGirlsRevealTrigger
        v-if="renderMode === 'progressive' && remainingCount"
        :auto="autoLoad"
        :count="nextBatchCount"
        :remaining="remainingCount"
        @reveal="showMore"
      />
    </template>
  </div>
</template>

<style scoped>
.valaxy-girls-overflow {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  padding: 0.75rem 0 0.25rem;
}

.valaxy-girls-overflow-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
  margin: 0;
  padding: 0.5rem;
}

.valaxy-girls-overflow-item {
  list-style: none;
}
</style>
