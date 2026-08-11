<script setup lang="ts">
import type { GirlReasonMode } from 'valaxy-addon-girls'
import type { GirlType } from '../types'
import ValaxyGirlCard from 'valaxy-addon-girls/components/ValaxyGirlCard.vue'

defineProps<{
  girl: GirlType
  i: number
  reasonMode?: GirlReasonMode
}>()
</script>

<template>
  <!-- @deprecated Use ValaxyGirlCard from valaxy-addon-girls. -->
  <ValaxyGirlCard :girl="girl" :index="i" :reason-mode="reasonMode" />
</template>
