<script setup lang="ts">
import { useAppStore } from 'valaxy'
import { computed, nextTick, onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{ transition?: boolean }>(), { transition: true })
const app = useAppStore()
const { t } = useI18n()
const mounted = shallowRef(false)
onMounted(() => {
  mounted.value = true
})
const title = computed(() => t(mounted.value && app.isDark ? 'button.toggle_light' : 'button.toggle_dark'))

async function toggle(event: MouseEvent) {
  const root = document.documentElement
  // All instances share the document transition; ignore clicks until it finishes.
  if (root.classList.contains('theme-reveal'))
    return
  if (!props.transition || !document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    app.toggleDark()
    return
  }

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX
  const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  // Percentages keep the mask aligned when snapshot and CSS pixel scales differ.
  const diagonal = Math.hypot(innerWidth, innerHeight) / Math.SQRT2
  root.style.setProperty('--theme-reveal-x', `${x / innerWidth * 100}%`)
  root.style.setProperty('--theme-reveal-y', `${y / innerHeight * 100}%`)
  root.style.setProperty('--theme-reveal-radius', `${radius / diagonal * 100}%`)
  root.classList.add('theme-reveal')

  let updated = false
  try {
    const transition = document.startViewTransition(async () => {
      app.toggleDark()
      updated = true
      await nextTick()
    })
    // A skipped snapshot is allowed; the theme update still completes.
    await transition.finished
  }
  catch {
    if (!updated)
      app.toggleDark()
  }
  finally {
    root.classList.remove('theme-reveal')
    for (const property of ['x', 'y', 'radius'])
      root.style.removeProperty(`--theme-reveal-${property}`)
  }
}
</script>

<template>
  <button type="button" class="yun-icon-btn yun-toggle-dark" :title="title" :aria-label="title" @mousedown.prevent @click="toggle">
    <div i="ri-sun-line dark:ri-moon-line" />
  </button>
</template>

<style>
.yun-toggle-dark { color: #f1cb64; }
html.dark .yun-toggle-dark { color: inherit; }

/* Override Valaxy's direction-dependent snapshot stacking in both themes. */
html.theme-reveal::view-transition-old(root) {
  z-index: 1;
  animation: none;
  mix-blend-mode: normal;
}
html.theme-reveal::view-transition-new(root) {
  z-index: 2;
  animation: theme-reveal-circle 450ms ease-out both;
  mix-blend-mode: normal;
}
@keyframes theme-reveal-circle {
  from { clip-path: circle(0 at var(--theme-reveal-x) var(--theme-reveal-y)); }
  to { clip-path: circle(var(--theme-reveal-radius) at var(--theme-reveal-x) var(--theme-reveal-y)); }
}
</style>
