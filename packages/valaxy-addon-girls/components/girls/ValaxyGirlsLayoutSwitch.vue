<script setup lang="ts">
import type { GirlsLayout } from '../../types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { GIRLS_LAYOUTS } from '../../client'

defineProps<{
  layout: GirlsLayout
}>()

const emit = defineEmits<{
  select: [layout: GirlsLayout]
}>()

const { t } = useI18n()
const layoutOptions = computed(() => GIRLS_LAYOUTS.map(layout => ({
  icon: {
    bubbles: 'i-ri-bubble-chart-line',
    grid: 'i-ri-layout-grid-line',
    orbit: 'i-ri-planet-line',
  }[layout],
  label: t(`addon.girls.layout.${layout}`, layout),
  value: layout,
})))
</script>

<template>
  <div
    class="valaxy-girls-layout-switch"
    role="toolbar"
    :aria-label="t('addon.girls.layout.label', 'Choose gallery layout')"
  >
    <button
      v-for="option in layoutOptions"
      :key="option.value"
      class="valaxy-girls-layout-button"
      :class="{ 'valaxy-girls-layout-button-active': option.value === layout }"
      type="button"
      :title="option.label"
      :aria-label="option.label"
      :aria-pressed="option.value === layout"
      @click="emit('select', option.value)"
    >
      <span :class="option.icon" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.valaxy-girls-layout-switch {
  display: inline-flex;
  padding: 0.2rem;
  background: var(--valaxy-girls-paper);
  border: 1px solid var(--valaxy-girls-line);
  border-radius: 0.625rem;
  box-shadow: var(--valaxy-girls-shadow);
  backdrop-filter: blur(0.7rem);
}

.valaxy-girls-layout-button {
  display: grid;
  width: 2rem;
  height: 2rem;
  padding: 0;
  place-items: center;
  color: var(--valaxy-girls-muted);
  background: transparent;
  border: 0;
  border-radius: 0.45rem;
  font-size: 0.92rem;
  cursor: pointer;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .valaxy-girls-layout-button:hover {
    color: var(--valaxy-girls-ink);
    background: var(--yun-action-btn-hover-bg, color-mix(in srgb, var(--valaxy-girls-ink) 7%, transparent));
  }
}

.valaxy-girls-layout-button-active {
  color: var(--valaxy-girls-sky);
  background: var(--valaxy-girls-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--valaxy-girls-sky) 36%, transparent);
}

.valaxy-girls-layout-button:focus-visible {
  outline: 2px solid var(--valaxy-girls-focus);
  outline-offset: 2px;
}

@media (pointer: coarse) {
  .valaxy-girls-layout-button {
    width: 2.75rem;
    height: 2.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girls-layout-button {
    transition: none;
  }
}
</style>
