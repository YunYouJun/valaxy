<script lang="ts" setup>
import type { LocalizedValaxyTheme, ThemeKind, ValaxyTheme } from '../data/themes'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { localizeTheme, themes as themeCatalog } from '../data/themes'

const props = defineProps<{
  themes?: readonly ValaxyTheme[]
}>()

const { locale, t } = useI18n()
const keyword = shallowRef('')
const kind = shallowRef<ThemeKind | 'all'>('all')
const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())
const sourceThemes = computed<readonly ValaxyTheme[]>(() => props.themes ?? themeCatalog)

const normalizedThemes = computed<LocalizedValaxyTheme[]>(() =>
  sourceThemes.value.map(theme => localizeTheme(theme, locale.value)),
)

const counts = computed<Record<ThemeKind | 'all', number>>(() => ({
  all: normalizedThemes.value.length,
  official: normalizedThemes.value.filter(theme => theme.kind === 'official').length,
  community: normalizedThemes.value.filter(theme => theme.kind === 'community').length,
}))

const filteredThemes = computed(() => {
  const query = normalizedKeyword.value

  return normalizedThemes.value.filter((item) => {
    if (kind.value !== 'all' && item.kind !== kind.value)
      return false

    if (!query)
      return true

    const source = sourceThemes.value.find(theme => theme.name === item.name)
    const descriptions = source ? Object.values(source.description) : [item.description]
    const searchableText = [item.name, ...item.tags, ...descriptions]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(query)
  })
})

const hasActiveFilters = computed(() => Boolean(normalizedKeyword.value) || kind.value !== 'all')

function handleTagClick(tag: string) {
  keyword.value = tag
}

function clearFilters() {
  keyword.value = ''
  kind.value = 'all'
}
</script>

<template>
  <ThemeGalleryFilters v-model:keyword="keyword" v-model:kind="kind" :counts="counts" />

  <p class="theme-gallery-summary" role="status" aria-live="polite">
    {{ t('themeGallery.results', { count: filteredThemes.length, total: normalizedThemes.length }) }}
  </p>

  <ul v-if="filteredThemes.length" class="theme-gallery-grid">
    <li v-for="theme in filteredThemes" :key="theme.name" class="theme-gallery-item">
      <ThemeGalleryCard :theme="theme" @tag-click="handleTagClick" />
    </li>
  </ul>

  <div v-else class="theme-gallery-empty">
    <span class="i-ri-layout-masonry-line theme-gallery-empty-icon" aria-hidden="true" />
    <p class="theme-gallery-empty-title">
      {{ t('themeGallery.noResults') }}
    </p>
    <p class="theme-gallery-empty-hint">
      {{ t('themeGallery.noResultsHint') }}
    </p>
    <button v-if="hasActiveFilters" type="button" class="theme-gallery-reset" @click="clearFilters">
      {{ t('themeGallery.clearFilters') }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.theme-gallery-summary {
  margin: 0 0 0.875rem;
  color: var(--va-c-text-3);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.theme-gallery-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.125rem;
  margin: 0 !important;
  padding: 0 !important;
}

.theme-gallery-item {
  min-width: 0;
  margin: 0 !important;
  list-style: none;
}

.theme-gallery-empty {
  display: grid;
  justify-items: center;
  min-height: 14rem;
  border: 1px dashed var(--va-c-divider);
  border-radius: 0.875rem;
  padding: 2.5rem 1rem;
  background:
    radial-gradient(circle at 50% 12%, rgb(var(--va-c-primary-rgb), 0.12), transparent 38%),
    radial-gradient(rgb(var(--va-c-primary-rgb), 0.14) 1px, transparent 1px),
    var(--va-c-default-soft);
  background-size: auto, 18px 18px, auto;
  text-align: center;
}

.theme-gallery-empty-icon {
  color: var(--va-c-text-3);
  font-size: 2rem;
}

.theme-gallery-empty-title {
  margin: 0.75rem 0 0;
  color: var(--va-c-text);
  font-weight: 600;
}

.theme-gallery-empty-hint {
  max-width: 28rem;
  margin: 0.35rem 0 1rem;
  color: var(--va-c-text-3);
  font-size: 0.875rem;
}

.theme-gallery-reset {
  min-height: 2.25rem;
  border: 1px solid var(--va-c-primary);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  background: var(--va-c-brand-soft);
  color: var(--va-c-primary);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--va-c-primary);
    outline-offset: 2px;
  }
}

@media (width >= 960px) {
  .theme-gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
