<script lang="ts" setup>
import { useBackToTop, useWindowScrollY } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { backToTop } from '../utils/animation'

const BACK_TO_TOP_OFFSET = 100

const supportsScrollTimeline = typeof window !== 'undefined'
  && typeof CSS !== 'undefined'
  && typeof CSS.supports === 'function'
  && CSS.supports('animation-timeline', 'scroll(root)')

const backToTopState = supportsScrollTimeline
  ? null
  : useBackToTop({ offset: BACK_TO_TOP_OFFSET })

const y = backToTopState ? null : useWindowScrollY()
const show = backToTopState
  ? backToTopState.show
  : computed(() => (y?.value ?? 0) > BACK_TO_TOP_OFFSET)

const { t } = useI18n()

const progressStyle = computed(() => {
  if (!backToTopState)
    return undefined

  const progress = Number.isFinite(backToTopState.percentage.value)
    ? backToTopState.percentage.value
    : 0
  const angle = Math.round(Math.min(1, Math.max(0, progress)) * 360)
  return angle > 0
    ? { '--yun-back-top-progress': `${angle}deg` }
    : undefined
})
</script>

<template>
  <button
    type="button"
    class="back-to-top yun-icon-btn"
    :aria-label="t('theme.backToTop')"
    :title="t('theme.backToTop')"
    :tabindex="show ? 0 : -1"
    :aria-hidden="!show"
    :class="show && 'show'"
    :style="progressStyle"
    @click="backToTop"
  >
    <div class="back-to-top-arrow" i-ri-arrow-up-s-line aria-hidden="true" />
  </button>
</template>

<style lang="scss">
@use '../styles/mixins/glass';

@property --yun-back-top-scroll-progress {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes yun-back-top-progress {
  from {
    --yun-back-top-scroll-progress: 0deg;
  }

  to {
    --yun-back-top-scroll-progress: 360deg;
  }
}

.back-to-top.yun-icon-btn {
  --yun-back-top-progress-opacity: 0.06;

  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: var(--yun-z-go-up-btn);
  width: 3rem;
  height: 3rem;
  padding: 0;
  box-sizing: border-box;
  isolation: isolate;
  overflow: visible;
  border: 0;
  border-radius: 50%;
  color: var(--va-c-link);
  background: transparent;

  // Keep the progress tint inside the face, underneath the arrow.
  &::before {
    @include glass.surface;

    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: inherit;
    transition: background-color 180ms ease, border-color 180ms ease, box-shadow 220ms ease;
    pointer-events: none;
  }

  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 180ms ease, visibility 180ms ease;

  &.show {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  @media (hover: hover) and (pointer: fine) {
    &.show:hover::before {
      border-color: color-mix(in srgb, var(--va-c-link) 36%, var(--yun-glass-border));
      background-color: var(--yun-glass-hover-fill);
      box-shadow: var(--yun-glass-hover-shadow);
    }
  }

  &.show:active::before {
    background-color: var(--yun-glass-pressed-fill);
    box-shadow: var(--yun-glass-pressed-shadow);
  }

  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    &::before,
    &.show:is(:hover, :active)::before {
      @include glass.solid;
    }
  }

  .back-to-top-arrow {
    position: relative;
    z-index: 1;
    width: 24px;
    height: 24px;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 1px;
    z-index: 0;
    border-radius: inherit;
    contain: paint;
    background: conic-gradient(
      from 0deg,
      rgb(var(--va-c-primary-rgb), var(--yun-back-top-progress-opacity)) 0deg var(--yun-back-top-progress, 0deg),
      transparent var(--yun-back-top-progress, 0deg) 360deg
    );
    pointer-events: none;
  }
}

html.dark .back-to-top.yun-icon-btn {
  --yun-back-top-progress-opacity: 0.1;
}

@supports (animation-timeline: scroll(root)) {
  .back-to-top.yun-icon-btn::after {
    background: conic-gradient(
      from 0deg,
      rgb(var(--va-c-primary-rgb), var(--yun-back-top-progress-opacity)) 0deg var(--yun-back-top-scroll-progress),
      transparent var(--yun-back-top-scroll-progress) 360deg
    );
    animation-name: yun-back-top-progress;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: scroll(root);
  }
}

@media (prefers-reduced-motion: reduce) {
  // Keep the scroll-linked progress indicator active; disable only timed transitions.
  .back-to-top.yun-icon-btn,
  .back-to-top.yun-icon-btn::before {
    transition: none;
  }
}
</style>
