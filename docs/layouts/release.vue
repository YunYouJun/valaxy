<script setup lang="ts">
import { useEventListener, useWindowScroll } from '@vueuse/core'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

// While the cyanotype plate is behind it, the nav becomes part of the plate:
// transparent, chalk-white text. Past the plate it is the regular solid nav.
const { y } = useWindowScroll()
// Start over the plate so the static HTML paints the transparent nav, not a white flash.
const plateBottom = shallowRef(Number.POSITIVE_INFINITY)

function measure() {
  const plate = document.querySelector<HTMLElement>('.galaxy-hero')
  plateBottom.value = plate ? plate.getBoundingClientRect().bottom + window.scrollY : 0
}

// Pages load lazily, so the plate may not exist yet when the layout mounts.
function measureSoon(tries = 30) {
  measure()
  if (!plateBottom.value && tries > 0)
    setTimeout(measureSoon, 100, tries - 1)
}

const route = useRoute()
onMounted(() => measureSoon())
watch(() => route.path, () => measureSoon(), { flush: 'post' })
useEventListener('resize', measure, { passive: true })

const overPlate = computed(() => plateBottom.value > 0 && y.value < plateBottom.value - 60)
</script>

<template>
  <div class="release-layout">
    <div class="release-nav" :class="{ 'is-over-plate': overPlate }">
      <PressNav />
    </div>
    <div class="release-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
/* Match --release-bg so overscroll and any gap around the sticky nav keep the page color. */
.release-layout {
  background: #eef3ff;
}

.dark .release-layout {
  background: #071238;
}

/* A transparent wrapper: PressNav stays sticky to the page, tokens still cascade. */
.release-nav {
  display: contents;
}

.release-nav :deep(.pr-navbar) {
  transition:
    background-color 240ms,
    border-color 240ms,
    color 240ms;
}

/* The open mobile menu keeps its own solid surface and colors. */
.release-nav.is-over-plate :deep(.press-nav:not(.is-screen-open)) {
  --pr-navbar-c-bg: transparent;
  --pr-nav-text: #fff;
  --pr-c-text-1: #fff;
  --pr-c-text-2: rgb(255 255 255 / 0.72);
  --pr-c-divider-light: transparent;
  --press-c-text-1: #fff;
  --press-c-text-2: rgb(255 255 255 / 0.72);
  --press-c-bg-soft: rgb(255 255 255 / 0.08);
  --press-c-divider: rgb(255 255 255 / 0.22);
  --docsearch-searchbox-background: rgb(255 255 255 / 0.08);
  --docsearch-text-color: #fff;
  --docsearch-muted-color: rgb(255 255 255 / 0.72);
  --va-c-bg-alt: rgb(255 255 255 / 0.08);
  --va-c-bg-soft: rgb(255 255 255 / 0.1);
  --va-c-text-1: #fff;
  --va-c-text-2: rgb(255 255 255 / 0.72);
  --va-c-divider: rgb(255 255 255 / 0.22);
  --pr-switch-bg: rgb(255 255 255 / 0.1);
  --pr-switch-divider: rgb(255 255 255 / 0.3);
}

.release-nav.is-over-plate :deep(.press-nav:not(.is-screen-open) .pr-navbar) {
  backdrop-filter: none;
}

/* The gradient wordmark would fight the plate; set it in chalk white instead. */
.release-nav.is-over-plate :deep(.press-nav:not(.is-screen-open) .pr-navbar-title) {
  color: #fff;
  background: none;
  -webkit-text-fill-color: currentcolor;
}
</style>
