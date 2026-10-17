<script setup lang="ts">
import { useId } from 'vue'

/**
 * An engraved globe for one theme: the theme's own ground and accent, and a
 * surface that says something about it (Yun's cloud bands, Press's ring,
 * Arknights' hazard stripes, Shuimo's ink and seal, Sakura's petals, antfu's
 * wireframe). Drawn on a 64 × 64 grid; the shadow side gives it volume.
 */
defineProps<{
  kind: 'yun' | 'press' | 'arknights' | 'shuimo' | 'sakura' | 'antfu'
  bg: string
  ink: string
  accent: string
}>()

// Stable between SSR and hydration, unique per globe.
const uid = `planet-${useId()}`
</script>

<template>
  <svg class="planet-globe" viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <clipPath :id="`${uid}-disc`">
        <circle cx="32" cy="32" r="24" />
      </clipPath>
    </defs>

    <!-- Press: the back half of the ring passes behind the globe. -->
    <ellipse v-if="kind === 'press'" cx="32" cy="32" rx="31" ry="8" fill="none" :stroke="accent" stroke-width="2" transform="rotate(-18 32 32)" pathLength="100" stroke-dasharray="0 50 50 0" />

    <circle cx="32" cy="32" r="24" :fill="bg" />

    <g :clip-path="`url(#${uid}-disc)`" fill="none" stroke-linecap="round">
      <template v-if="kind === 'yun'">
        <path v-for="y in [20, 29, 38, 47]" :key="y" :d="`M4 ${y} q7 -5 14 0 t14 0 t14 0 t14 0 t14 0`" :stroke="accent" stroke-width="2.4" :opacity="y === 29 || y === 47 ? 1 : 0.45" />
      </template>
      <template v-else-if="kind === 'press'">
        <path v-for="y in [22, 32, 42]" :key="y" :d="`M6 ${y} H58`" :stroke="ink" stroke-width="1" opacity="0.18" />
      </template>
      <template v-else-if="kind === 'arknights'">
        <path v-for="x in [-16, -4, 8, 20, 32, 44, 56]" :key="x" :d="`M${x} 64 L${x + 24} 0`" :stroke="accent" stroke-width="5" />
      </template>
      <template v-else-if="kind === 'shuimo'">
        <path d="M14 40c4-10 14-14 22-12 9 2 14 9 12 15-3 7-13 9-21 7-8-1-15-4-13-10z" :fill="ink" opacity="0.82" stroke="none" />
        <path d="M18 24c6-5 16-6 22-2 4 3 1 7-6 7-8 0-14-1-16-5z" :fill="ink" opacity="0.28" stroke="none" />
      </template>
      <template v-else-if="kind === 'sakura'">
        <g :fill="accent" stroke="none" opacity="0.85">
          <ellipse v-for="a in [0, 72, 144, 216, 288]" :key="a" cx="32" cy="22" rx="5" ry="9" :transform="`rotate(${a} 32 32)`" />
        </g>
        <circle cx="32" cy="32" r="3" :fill="bg" stroke="none" />
      </template>
      <template v-else>
        <ellipse v-for="rx in [24, 15, 6]" :key="rx" cx="32" cy="32" :rx="rx" ry="24" :stroke="ink" stroke-width="1.2" />
        <path v-for="y in [16, 24, 32, 40, 48]" :key="y" :d="`M4 ${y} H60`" :stroke="ink" stroke-width="1.2" />
      </template>
      <!-- Shadow side, as on an engraved celestial globe. -->
      <circle cx="60" cy="35" r="25" :fill="ink" opacity="0.2" stroke="none" />
    </g>

    <circle cx="32" cy="32" r="24" fill="none" :stroke="accent" stroke-width="1.5" />

    <!-- Press: the front half of the ring crosses in front. -->
    <ellipse v-if="kind === 'press'" cx="32" cy="32" rx="31" ry="8" fill="none" :stroke="accent" stroke-width="2" transform="rotate(-18 32 32)" pathLength="100" stroke-dasharray="50 50" />
    <!-- Shuimo's moon is its seal; Sakura's is a falling petal. -->
    <rect v-if="kind === 'shuimo'" x="50" y="6" width="10" height="10" rx="1.5" :fill="accent" />
    <ellipse v-if="kind === 'sakura'" cx="55" cy="11" rx="3" ry="5" :fill="accent" transform="rotate(35 55 11)" />
  </svg>
</template>

<style scoped>
.planet-globe {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
