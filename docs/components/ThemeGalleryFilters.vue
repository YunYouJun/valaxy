<script lang="ts" setup>
import type { ThemeKind } from '../data/themes'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  counts: Record<ThemeKind | 'all', number>
}>()

const keyword = defineModel<string>('keyword', { default: '' })
const kind = defineModel<ThemeKind | 'all'>('kind', { default: 'all' })

const { t } = useI18n()
const filterOptions = computed(() => [
  { value: 'all' as const, label: t('themeGallery.all'), count: props.counts.all },
  { value: 'official' as const, label: t('themeGallery.official'), count: props.counts.official },
  { value: 'community' as const, label: t('themeGallery.community'), count: props.counts.community },
])
</script>

<template>
  <div class="theme-gallery-controls">
    <div class="theme-gallery-search">
      <span class="i-ri-search-line theme-gallery-search-icon" aria-hidden="true" />
      <input
        v-model="keyword"
        :aria-label="t('themeGallery.search')"
        :placeholder="t('themeGallery.searchPlaceholder')"
        class="theme-gallery-search-input"
        type="search"
        name="theme-search"
      >
    </div>

    <div class="theme-gallery-filters" role="group" :aria-label="t('themeGallery.filter')">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        type="button"
        class="theme-gallery-filter"
        :class="{ 'is-active': kind === option.value }"
        :aria-pressed="kind === option.value"
        @click="kind = option.value"
      >
        <span>{{ option.label }}</span>
        <span class="theme-gallery-filter-count">{{ option.count }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.theme-gallery-controls {
  position: relative;
  display: grid;
  gap: 0.75rem;
  margin: 1.25rem 0 0.75rem;
  overflow: hidden;
  border: 1px solid var(--va-c-divider);
  border-radius: 1rem;
  padding: 1rem;
  background:
    radial-gradient(circle at 92% -24%, rgb(var(--va-c-primary-rgb), 0.2), transparent 42%),
    var(--va-c-default-soft);

  &::before {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgb(var(--va-c-primary-rgb), 0.2) 1px, transparent 1px);
    background-size: 18px 18px;
    content: '';
    mask-image: linear-gradient(90deg, transparent 8%, black 58%, transparent 100%);
    opacity: 0.5;
    pointer-events: none;
  }
}

.theme-gallery-search,
.theme-gallery-filters {
  position: relative;
  z-index: 1;
}

.theme-gallery-search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  color: var(--va-c-primary);
  font-size: 1.125rem;
  pointer-events: none;
  transform: translateY(-50%);
}

.theme-gallery-search-input {
  width: 100%;
  height: 2.875rem;
  padding: 0 1rem 0 2.75rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.75rem;
  outline: none;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.04), inset 0 1px rgb(255 255 255 / 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

  &:focus-visible {
    border-color: var(--va-c-primary);
    box-shadow: 0 0 0 3px rgb(var(--va-c-primary-rgb), 0.14), 0 12px 28px rgb(15 23 42 / 0.08);
  }
}

.theme-gallery-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.theme-gallery-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.25rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  background: var(--va-c-bg);
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  cursor: pointer;
  box-shadow: 0 3px 10px rgb(15 23 42 / 0.03);
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: var(--va-c-primary);
    color: var(--va-c-primary);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--va-c-primary);
    outline-offset: 2px;
  }

  &.is-active {
    border-color: var(--va-c-primary);
    background: linear-gradient(135deg, var(--va-c-brand-soft), rgb(var(--va-c-primary-rgb), 0.08));
    color: var(--va-c-primary);
    box-shadow: 0 6px 18px rgb(var(--va-c-primary-rgb), 0.12);
  }
}

.theme-gallery-filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  padding: 0 0.3rem;
  background: var(--va-c-bg);
  color: var(--va-c-text-3);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.theme-gallery-filter.is-active .theme-gallery-filter-count {
  background: rgb(var(--va-c-primary-rgb), 0.12);
  color: var(--va-c-primary);
}

@media (width <= 640px) {
  .theme-gallery-controls {
    gap: 0.625rem;
    border-radius: 0.875rem;
    padding: 0.75rem;
  }

  .theme-gallery-filters {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.375rem;
  }

  .theme-gallery-filter {
    justify-content: space-between;
    min-width: 0;
    padding: 0.35rem 0.55rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-gallery-search-input,
  .theme-gallery-filter {
    transition: none;
  }

  .theme-gallery-filter:hover {
    transform: none;
  }
}
</style>
