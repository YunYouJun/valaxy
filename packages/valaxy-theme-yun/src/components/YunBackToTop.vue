<template>
  <a href="#" class="back-to-top yun-icon-btn" :class="show && 'show'">
    <div w="8" h="8" i-ri-arrow-up-s-line />
    <svg class="progress-circle-container" viewBox="0 0 100 100">
      <circle :stroke-dasharray="`${circumference} ${circumference}`" :stroke-dashoffset="strokeOffset" class="progress-circle" cx="50" cy="50" :r="radius" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </a>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useBackToTop } from '~/composables'

const { show, percentage } = useBackToTop({ offset: 100 })

const radius = 48
const circumference = 2 * radius * Math.PI

const strokeOffset = computed(() => {
  // 周长
  const val = (1 - percentage.value) * circumference
  return val < 0 ? 0 : val
})
</script>

<style lang="scss">
@use "sass:map";
@use "~/styles/vars" as *;

.back-to-top {
  position: relative;
  position: fixed;
  right: -0.9rem;
  bottom: 1.1rem;
  z-index: map.get($z-index, 'go-up-btn');
  opacity: 0;
  color: var(--yun-c-primary);

  &.show {
    transform: translateX(-30px) rotate(360deg);
    opacity: 1;
  }

  .icon {
    width: 2.5rem;
    height: 2.5rem;
  }
}

.progress-circle {
  transition: 0.3s stroke-dashoffset;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;

  &-container {
    position: absolute;
  }
}
</style>
