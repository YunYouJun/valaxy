<script lang="ts" setup>
import { useBackToTop } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { show, percentage, backToTop } = useBackToTop({ offset: 100 })

const { t } = useI18n()

const progressAngle = computed(() => {
  const progress = Number.isFinite(percentage.value) ? percentage.value : 0
  return `${Math.min(1, Math.max(0, progress)) * 360}deg`
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
    :style="{ '--yun-back-top-progress': progressAngle }"
    @click="backToTop"
  >
    <div class="back-to-top-arrow" i-ri-arrow-up-s-line aria-hidden="true" />
  </button>
</template>

<style lang="scss">
.back-to-top.yun-icon-btn {
  --yun-back-top-bg: var(--va-c-bg-soft);
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
  color: var(--va-c-primary);
  background: transparent;

  // Keep the progress tint inside the face, underneath the arrow.
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    border: 1px solid rgb(var(--va-c-primary-rgb), 0.08);
    border-radius: inherit;
    background: var(--yun-back-top-bg);
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.08);
    transition: background-color 180ms ease;
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

  @media (hover: hover) {
    &.show:hover {
      --yun-back-top-bg: color-mix(in srgb, var(--va-c-bg-soft) 94%, var(--va-c-primary));
    }
  }

  &.show:active {
    --yun-back-top-bg: color-mix(in srgb, var(--va-c-bg-soft) 88%, var(--va-c-primary));
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

@media (prefers-reduced-motion: reduce) {
  .back-to-top.yun-icon-btn,
  .back-to-top.yun-icon-btn::before {
    transition: none;
  }
}
</style>
