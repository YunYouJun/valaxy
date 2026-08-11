<script setup lang="ts">
import type { Component } from 'vue'
import type { GirlReasonMode, GirlsHeaderSlotProps, GirlsLayout, GirlsMotionMode, GirlsRenderMode, GirlsSource } from '../types'
import { computed, shallowRef, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGirls } from '../client'
import ValaxyGirlsBubbles from './girls/ValaxyGirlsBubbles.vue'
import ValaxyGirlsGrid from './girls/ValaxyGirlsGrid.vue'
import ValaxyGirlsLayoutSwitch from './girls/ValaxyGirlsLayoutSwitch.vue'
import ValaxyGirlsOrbit from './girls/ValaxyGirlsOrbit.vue'

const props = withDefaults(defineProps<{
  autoLoad?: boolean
  batchSize?: number
  girls: GirlsSource
  initialCount?: number
  layout?: GirlsLayout
  motion?: GirlsMotionMode
  random?: boolean
  reasonMode?: GirlReasonMode
  renderMode?: GirlsRenderMode
  switchable?: boolean
}>(), {
  autoLoad: true,
  batchSize: 24,
  initialCount: 24,
  layout: 'grid',
  motion: 'auto',
  random: false,
  reasonMode: 'hidden',
  renderMode: 'progressive',
  switchable: false,
})

const emit = defineEmits<{
  'layoutChange': [layout: GirlsLayout]
  'update:layout': [layout: GirlsLayout]
}>()

defineSlots<{
  header?: (props: GirlsHeaderSlotProps) => unknown
}>()

const { t } = useI18n()
const {
  error,
  girls: entries,
  isLoading,
  reload,
} = useGirls(toRef(props, 'girls'), {
  random: toRef(props, 'random'),
})

const count = computed(() => entries.value.length)
const activeLayout = shallowRef<GirlsLayout>(normalizeLayout(props.layout))
const selectedIndex = shallowRef(0)
const skeletonItems = Array.from({ length: 12 }, (_, index) => index)
const layoutComponents = {
  bubbles: ValaxyGirlsBubbles,
  grid: ValaxyGirlsGrid,
  orbit: ValaxyGirlsOrbit,
} satisfies Record<GirlsLayout, Component>
const layoutComponent = computed(() => layoutComponents[activeLayout.value])
const rootClasses = computed(() => ({
  'valaxy-girls': true,
  [`valaxy-girls-layout-${activeLayout.value}`]: true,
  'valaxy-girls-motion-off': props.motion === 'off',
  'not-prose': true,
}))

watch(() => props.layout, layout => activeLayout.value = normalizeLayout(layout))
watch(count, (nextCount) => {
  if (selectedIndex.value >= nextCount)
    selectedIndex.value = 0
})

function selectLayout(layout: GirlsLayout) {
  activeLayout.value = layout
  emit('update:layout', layout)
  emit('layoutChange', layout)
}

function normalizeLayout(layout: GirlsLayout | string): GirlsLayout {
  if (layout === 'cloud' || layout === 'wings')
    return 'bubbles'
  if (layout === 'bubbles' || layout === 'grid' || layout === 'orbit')
    return layout
  return 'grid'
}

function selectGirl(index: number) {
  selectedIndex.value = index
}
</script>

<template>
  <section
    :class="rootClasses"
    :aria-label="t('addon.girls.label', 'Character gallery')"
  >
    <slot
      v-if="$slots.header"
      name="header"
      :count="count"
      :error="error"
      :is-loading="isLoading"
      :random="Boolean(random)"
    />

    <div v-if="switchable && count" class="valaxy-girls-controls">
      <ValaxyGirlsLayoutSwitch :layout="activeLayout" @select="selectLayout" />
    </div>

    <component
      :is="layoutComponent"
      v-if="count"
      :auto-load="autoLoad"
      :girls="entries"
      :batch-size="batchSize"
      :initial-count="initialCount"
      :motion="motion"
      :reason-mode="reasonMode"
      :render-mode="renderMode"
      :selected-index="selectedIndex"
      @select="selectGirl"
    />

    <ol
      v-else-if="isLoading"
      class="valaxy-girls-skeleton-grid"
      :aria-label="t('addon.girls.loading', 'Loading character list')"
      aria-busy="true"
    >
      <li v-for="item in skeletonItems" :key="item" class="valaxy-girls-skeleton">
        <span class="valaxy-girls-skeleton-portrait" />
        <span class="valaxy-girls-skeleton-name" />
        <span class="valaxy-girls-skeleton-from" />
      </li>
    </ol>

    <div v-else-if="error" class="valaxy-girls-error" role="status">
      <span class="valaxy-girls-error-heart i-ri-heart-3-line" aria-hidden="true" />
      <p>{{ t('addon.girls.error', 'The list could not be loaded. Please try again later.') }}</p>
      <button class="valaxy-girls-retry" type="button" @click="reload">
        {{ t('addon.girls.retry', 'Retry') }}
      </button>
    </div>

    <p v-else class="valaxy-girls-empty">
      {{ t('addon.girls.empty', 'No characters yet') }}
    </p>
  </section>
</template>

<style scoped>
.valaxy-girls {
  --valaxy-girls-soft: color-mix(in srgb, var(--va-c-primary) 8%, var(--va-c-bg-soft));
  --valaxy-girls-sky: #70c5e8;
  --valaxy-girls-sky-deep: color-mix(in srgb, var(--valaxy-girls-sky) 68%, var(--va-c-text-1));
  --valaxy-girls-blush: #ff8fba;
  --valaxy-girls-ink: var(--va-c-text-1);
  --valaxy-girls-muted: var(--va-c-text-2);
  --valaxy-girls-paper: var(--va-c-bg-light);
  --valaxy-girls-line: color-mix(in srgb, var(--va-c-primary) 14%, var(--va-c-divider));

  position: relative;
  margin: 0.9rem 0 1.75rem;
  color: var(--valaxy-girls-ink);
}

.valaxy-girls-controls {
  display: flex;
  justify-content: flex-end;
  margin: -0.25rem 0 0.65rem;
}

.valaxy-girls-motion-off :deep(.valaxy-girl-item) {
  animation: none;
}

.valaxy-girls-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: clamp(0.6rem, 1.5vw, 0.75rem);
  justify-content: start;
  margin: 0;
  padding: 0;
}

.valaxy-girls-skeleton {
  display: grid;
  overflow: hidden;
  min-width: 0;
  min-height: 4.75rem;
  grid-template-columns: 3.75rem minmax(0, 1fr);
  grid-template-rows: repeat(2, 1fr);
  list-style: none;
  background: var(--valaxy-girls-paper);
  border: 1px solid var(--valaxy-girls-line);
  border-radius: 0.65rem;
}

.valaxy-girls-skeleton-portrait,
.valaxy-girls-skeleton-name,
.valaxy-girls-skeleton-from {
  display: block;
  background: linear-gradient(
    90deg,
    var(--valaxy-girls-soft),
    var(--valaxy-girls-paper),
    var(--valaxy-girls-soft)
  );
  background-size: 200% 100%;
  animation: valaxy-girls-skeleton 1.4s ease-in-out infinite;
}

.valaxy-girls-skeleton-portrait {
  min-height: 4.75rem;
  grid-row: 1 / 3;
}

.valaxy-girls-skeleton-name {
  width: 58%;
  height: 0.62rem;
  align-self: end;
  margin: 0 0 0.24rem 0.72rem;
  border-radius: 999px;
}

.valaxy-girls-skeleton-from {
  width: 74%;
  height: 0.46rem;
  align-self: start;
  margin: 0.24rem 0 0 0.72rem;
  border-radius: 999px;
}

.valaxy-girls-error,
.valaxy-girls-empty {
  display: grid;
  min-height: 8rem;
  place-items: center;
  align-content: center;
  gap: 0.65rem;
  margin: 0;
  padding: 2rem;
  color: var(--valaxy-girls-muted);
  background: var(--valaxy-girls-soft);
  border: 1px dashed var(--valaxy-girls-sky);
  border-radius: 0.75rem;
  font-size: 0.82rem;
  text-align: center;
}

.valaxy-girls-error p {
  margin: 0;
}

.valaxy-girls-error-heart {
  color: var(--valaxy-girls-blush);
  font-size: 1.8rem;
}

.valaxy-girls-retry {
  padding: 0.42rem 0.9rem;
  color: var(--valaxy-girls-sky-deep);
  background: var(--valaxy-girls-paper);
  border: 1px solid var(--valaxy-girls-sky);
  border-radius: 999px;
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.valaxy-girls-retry:hover {
  color: var(--valaxy-girls-paper);
  background: var(--valaxy-girls-sky-deep);
}

.valaxy-girls-retry:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--valaxy-girls-sky) 45%, transparent);
  outline-offset: 3px;
}

@keyframes valaxy-girls-skeleton {
  from {
    background-position: 120% 0;
  }

  to {
    background-position: -80% 0;
  }
}

@media (width <= 40rem) {
  .valaxy-girls-skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 22rem) {
  .valaxy-girls-skeleton-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .valaxy-girls-skeleton {
    grid-template-columns: 4.25rem minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girls-skeleton-portrait,
  .valaxy-girls-skeleton-name,
  .valaxy-girls-skeleton-from {
    animation: none;
  }
}
</style>
