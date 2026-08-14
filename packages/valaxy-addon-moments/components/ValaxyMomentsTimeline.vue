<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { groupMomentsByYear, useMoments } from '../client'

const { t } = useI18n()
const moments = useMoments()
const years = computed(() => groupMomentsByYear(moments.value))

function navigate(anchor: string) {
  if (typeof window === 'undefined')
    return
  window.dispatchEvent(new CustomEvent('valaxy-moments:navigate', { detail: anchor }))
}
</script>

<template>
  <div class="valaxy-moments-timeline">
    <slot name="title" :title="t('addon.moments.timeline')">
      <h2>{{ t('addon.moments.timeline') }}</h2>
    </slot>
    <nav :aria-label="t('addon.moments.timeline')">
      <section v-for="year in years" :key="year.year">
        <strong>{{ year.year }}</strong>
        <button
          v-for="month in year.months"
          :key="month.anchor"
          type="button"
          @click="navigate(month.anchor)"
        >
          <span>{{ month.label }} {{ t('addon.moments.month') }}</span>
          <small>{{ month.moments.length }}</small>
        </button>
      </section>
    </nav>
  </div>
</template>

<style scoped>
.valaxy-moments-timeline {
  width: 100%;
  padding: 0 1.5rem 1.25rem;
  text-align: left;
}

.valaxy-moments-timeline h2 {
  margin: 0 0 1rem;
  font-family: serif;
  text-align: center;
}

.valaxy-moments-timeline nav,
.valaxy-moments-timeline section {
  display: grid;
  gap: 0.4rem;
}

.valaxy-moments-timeline nav {
  gap: 1rem;
}

.valaxy-moments-timeline strong {
  padding-left: 0.7rem;
  color: var(--va-c-text-1, #202124);
  border-left: 3px solid var(--va-c-primary, #4f8cff);
}

.valaxy-moments-timeline button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.7rem;
  color: var(--va-c-text-2, #74777d);
  font: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 0.4rem;
  cursor: pointer;
}

.valaxy-moments-timeline button:hover {
  color: var(--va-c-primary, #4f8cff);
  background: var(--va-c-bg-soft, rgb(128 128 128 / 0.08));
}

.valaxy-moments-timeline small {
  min-width: 1.5rem;
  text-align: right;
}
</style>
