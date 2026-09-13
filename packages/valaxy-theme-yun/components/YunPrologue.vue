<script setup lang="ts">
import type { YunTheme } from '../types'
import { useMediaQuery, usePreferredReducedMotion } from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'

const props = defineProps<{
  /** Grid options. The slot contains the homepage banner and its navigation. */
  grid?: YunTheme.BannerGrid
}>()

const surface = useTemplateRef<HTMLElement>('surface')
const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
const reducedMotion = usePreferredReducedMotion()
const interactive = computed(() => props.grid?.enable !== false
  && props.grid?.interactive === true && finePointer.value && reducedMotion.value !== 'reduce')
const active = shallowRef(false)
let frame = 0
let pointerX = 0
let pointerY = 0

function resetPointer() {
  active.value = false
  if (frame)
    cancelAnimationFrame(frame)
  frame = 0
}

function onPointerMove(event: PointerEvent) {
  if (!interactive.value || event.pointerType !== 'mouse')
    return

  pointerX = event.clientX
  pointerY = event.clientY
  if (frame)
    return

  // Update the decorative layer at most once per frame without rerendering the banner.
  frame = requestAnimationFrame(() => {
    frame = 0
    const element = surface.value
    if (!element)
      return
    const rect = element.getBoundingClientRect()
    element.style.setProperty('--yun-grid-pointer-x', `${pointerX - rect.left}px`)
    element.style.setProperty('--yun-grid-pointer-y', `${pointerY - rect.top}px`)
    active.value = true
  })
}

watch(interactive, resetPointer)
onBeforeUnmount(resetPointer)
</script>

<template>
  <div ref="surface" class="yun-prologue" @pointermove="onPointerMove" @pointerleave="resetPointer" @pointercancel="resetPointer">
    <div
      v-if="grid?.enable !== false"
      class="grid-bg yun-prologue-grid"
      :class="{ 'is-faded': grid?.fade, 'is-active': active }"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.yun-prologue {
  position: relative;
  isolation: isolate;
  width: 100%;
}

.yun-prologue-grid {
  --grid-line: var(--yun-grid-color);

  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  &,
  &::after {
    background-image:
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
      linear-gradient(var(--grid-line) 1px, transparent 1px);
    background-size: var(--yun-grid-size) var(--yun-grid-size);
  }

  &.is-faded {
    mask-image: radial-gradient(
      ellipse at 50% 45%,
      rgb(0 0 0 / var(--yun-grid-center-opacity, 1)) 15%,
      rgb(0 0 0 / var(--yun-grid-center-opacity, 1)) 35%,
      transparent 75%
    );
  }

  &::after {
    --grid-line: var(--yun-grid-highlight-color);

    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    mask-image: radial-gradient(
      circle var(--yun-grid-highlight-radius) at var(--yun-grid-pointer-x, 50%) var(--yun-grid-pointer-y, 50%),
      black, transparent
    );
    transition: opacity 250ms ease;
  }

  &.is-active::after {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce), (hover: none), (pointer: coarse) {
  .yun-prologue-grid::after {
    display: none;
  }
}
</style>
