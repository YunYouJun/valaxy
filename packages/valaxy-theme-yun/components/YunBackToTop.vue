<script lang="ts" setup>
import { useBackToTop } from 'valaxy'
import { computed } from 'vue'

const { show, percentage, backToTop } = useBackToTop({ offset: 100 })

const radius = 48
const circumference = 2 * radius * Math.PI

const strokeOffset = computed(() => {
  // 周长
  const val = (1 - percentage.value) * circumference
  return val < 0 ? 0 : val
})
</script>

<template>
  <a
    href="#"
    class="back-to-top yun-icon-btn bg-$va-c-bg-soft shadow-md"
    :class="show && 'show'"
    @click="backToTop"
  >
    <div class="size-8" i-ri-arrow-up-s-line />
    <svg class="progress-circle-container" viewBox="0 0 100 100">
      <circle
        :stroke-dasharray="`${circumference} ${circumference}`"
        :stroke-dashoffset="strokeOffset"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        class="progress-circle" cx="50" cy="50" :r="radius" fill="none"
      />
    </svg>
  </a>
</template>

<style lang="scss">
@use "sass:map";

.back-to-top {
  position: fixed;
  right: -1.5rem;
  bottom: 1rem;
  z-index: var(--yun-z-go-up-btn);
  opacity: 0;
  pointer-events: none;
  color: var(--va-c-primary);
  transform: translateX(0) rotate(270deg);

  // override yun-icon-btn transition
  transition: all var(--va-transition-duration), opacity var(--va-transition-duration-fast) !important;

  &.show {
    transform: translateX(-40px) rotate(360deg);
    opacity: 1;
    pointer-events: fill;
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
