<script setup lang="ts">
import type { MomentsAuthor } from '../types'
import { useMediumZoom, useSiteConfig, useValaxyI18n } from 'valaxy'
import { computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getMomentMonth, getMomentMonthAnchorTargets, groupMomentsByYear, partitionPinnedMoments, useMoments, useMomentsConfig, useMomentsProgressiveCount } from '../client'
import ValaxyMomentCard from './ValaxyMomentCard.vue'

const props = withDefaults(defineProps<{
  batchSize?: number
  description?: string
  initialCount?: number
  title?: string
}>(), {})

const { t } = useI18n()
const { $t, $tO } = useValaxyI18n()
const addon = useMomentsConfig()
const siteConfig = useSiteConfig()
const moments = useMoments()
useMediumZoom()

const title = computed(() => props.title ?? addon.value?.options?.title ?? 'Moments')
const description = computed(() => props.description ?? addon.value?.options?.description)
const initialCount = computed(() => props.initialCount ?? addon.value?.options?.initialCount ?? 10)
const batchSize = computed(() => props.batchSize ?? addon.value?.options?.batchSize ?? 10)
const author = computed<MomentsAuthor>(() => {
  const rawName = addon.value?.options?.author?.name || siteConfig.value.author.name
  const localizedName = $tO(rawName as string | Record<string, string>)
  return {
    avatar: addon.value?.options?.author?.avatar || siteConfig.value.author.avatar,
    name: typeof localizedName === 'string' ? $t(localizedName) : '',
  }
})

const { remainingCount, showMore, visibleCount } = useMomentsProgressiveCount(
  () => moments.value.length,
  initialCount,
  batchSize,
)
const visibleMoments = computed(() => moments.value.slice(0, visibleCount.value))
const partitionedMoments = computed(() => partitionPinnedMoments(visibleMoments.value))
const pinnedMoments = computed(() => partitionedMoments.value.pinned)
const groupedMoments = computed(() => groupMomentsByYear(partitionedMoments.value.regular))
const monthAnchorTargets = computed(() => getMomentMonthAnchorTargets(moments.value))

function getMonthAnchorId(moment: (typeof moments.value)[number]) {
  const anchor = getMomentMonth(moment.date).anchor
  return monthAnchorTargets.value.get(anchor) === moment.path ? anchor : undefined
}

async function navigateToMonth(event: Event) {
  const anchor = (event as CustomEvent<string>).detail
  while (!document.getElementById(anchor) && remainingCount.value) {
    showMore()
    await nextTick()
  }

  await nextTick()
  document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => window.addEventListener('valaxy-moments:navigate', navigateToMonth))
onBeforeUnmount(() => window.removeEventListener('valaxy-moments:navigate', navigateToMonth))
</script>

<template>
  <section class="valaxy-moments" aria-labelledby="valaxy-moments-title">
    <slot name="header" :description="description" :title="title">
      <header class="valaxy-moments-heading">
        <h1 id="valaxy-moments-title">
          {{ title }}
        </h1>
        <p v-if="description">
          {{ description }}
        </p>
      </header>
    </slot>

    <div v-if="visibleMoments.length" class="valaxy-moments-list">
      <div v-if="pinnedMoments.length" class="valaxy-moments-pinned">
        <div v-for="moment in pinnedMoments" :key="moment.path">
          <ValaxyMomentCard
            :id="getMonthAnchorId(moment)"
            :author="author"
            :moment="moment"
          />
        </div>
      </div>

      <template v-for="year in groupedMoments" :key="year.year">
        <section v-for="month in year.months" :key="month.anchor" class="valaxy-moments-month">
          <h2 class="valaxy-moments-period">
            {{ year.year }} / {{ month.label }}
          </h2>
          <ValaxyMomentCard
            v-for="moment in month.moments"
            :id="getMonthAnchorId(moment)"
            :key="moment.path"
            :author="author"
            :moment="moment"
          />
        </section>
      </template>
    </div>

    <p v-else class="valaxy-moments-empty">
      {{ t('addon.moments.empty', 'No moments yet.') }}
    </p>

    <button
      v-if="remainingCount"
      class="valaxy-moments-more"
      type="button"
      @click="showMore"
    >
      {{ t('addon.moments.more', { count: remainingCount }) }}
    </button>
  </section>
</template>

<style scoped>
.valaxy-moments {
  width: 100%;
  margin: 0 auto 4rem;
}

.valaxy-moments-heading {
  margin-bottom: 1.5rem;
  text-align: center;
}

.valaxy-moments-heading h1 {
  margin: 0;
  color: var(--va-c-text-1, #202124);
  font-size: clamp(1.8rem, 5vw, 2.6rem);
}

.valaxy-moments-heading p {
  margin: 0.5rem 0 0;
  color: var(--va-c-text-2, #74777d);
}

.valaxy-moments-list {
  display: grid;
  gap: 1rem;
}

.valaxy-moments-pinned {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.valaxy-moments-empty {
  padding: 3rem 1rem;
  color: var(--va-c-text-2, #74777d);
  text-align: center;
}

.valaxy-moments-more {
  display: block;
  min-width: 9rem;
  padding: 0.7rem 1rem;
  margin: 1.25rem auto 0;
  color: var(--va-c-primary, #4f8cff);
  font: inherit;
  background: var(--va-c-bg-light, #fff);
  border: 1px solid currentcolor;
  border-radius: 999px;
  cursor: pointer;
}

.valaxy-moments-month {
  display: grid;
  gap: 1rem;
  scroll-margin-top: 6rem;
}

.valaxy-moments-period {
  padding-left: 0.75rem;
  margin: 0.5rem 0 -0.25rem;
  color: var(--va-c-text-2, #74777d);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  border-left: 3px solid var(--va-c-primary, #4f8cff);
}

.valaxy-moments-more:hover {
  color: white;
  background: var(--va-c-primary, #4f8cff);
}

.valaxy-moments-more:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--va-c-primary, #4f8cff) 35%, transparent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .valaxy-moments-more {
    transition: color 160ms ease, background-color 160ms ease;
  }
}

@media (width < 768px) {
  .valaxy-moments {
    padding-inline: 1rem;
  }
}
</style>
