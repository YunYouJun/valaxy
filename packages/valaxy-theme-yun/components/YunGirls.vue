<script lang="ts" setup>
import type { GirlReasonMode, GirlsLayout, GirlsMotionMode, GirlsRenderMode, GirlsSource } from 'valaxy-addon-girls'
import ValaxyGirls from 'valaxy-addon-girls/components/ValaxyGirls.vue'

defineProps<{
  autoLoad?: boolean
  batchSize?: number
  girls: GirlsSource
  initialCount?: number
  layout?: GirlsLayout
  motion?: GirlsMotionMode
  random?: boolean
  reasonMode?: GirlReasonMode
  renderMode?: GirlsRenderMode
  switchable?: boolean
}>()

const emit = defineEmits<{
  'layoutChange': [layout: GirlsLayout]
  'update:layout': [layout: GirlsLayout]
}>()
</script>

<template>
  <!-- @deprecated Use ValaxyGirls from valaxy-addon-girls. -->
  <ValaxyGirls
    :auto-load="autoLoad"
    :batch-size="batchSize"
    :girls="girls"
    :initial-count="initialCount"
    :layout="layout"
    :motion="motion"
    :random="random"
    :reason-mode="reasonMode"
    :render-mode="renderMode"
    :switchable="switchable"
    @layout-change="emit('layoutChange', $event)"
    @update:layout="emit('update:layout', $event)"
  />
</template>
