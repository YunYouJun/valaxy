<script lang="ts" setup>
import type { AddonKind, LocalizedValaxyAddon, ValaxyAddon } from '../data/addons'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { addons as addonCatalog, localizeAddon } from '../data/addons'

const props = defineProps<{
  addons?: readonly ValaxyAddon[]
}>()

const { locale, t } = useI18n()
const keyword = shallowRef('')
const kind = shallowRef<AddonKind | 'all'>('all')
const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())
const sourceAddons = computed<readonly ValaxyAddon[]>(() => props.addons ?? addonCatalog)

const normalizedAddons = computed<LocalizedValaxyAddon[]>(() =>
  sourceAddons.value.map(addon => localizeAddon(addon, locale.value)),
)

const counts = computed<Record<AddonKind | 'all', number>>(() => ({
  all: normalizedAddons.value.length,
  official: normalizedAddons.value.filter(addon => addon.kind === 'official').length,
  community: normalizedAddons.value.filter(addon => addon.kind === 'community').length,
}))

const filteredAddons = computed(() => {
  const query = normalizedKeyword.value

  return normalizedAddons.value.filter((item) => {
    if (kind.value !== 'all' && item.kind !== kind.value)
      return false

    if (!query)
      return true

    const source = sourceAddons.value.find(addon => addon.name === item.name)
    const descriptions = source ? Object.values(source.description) : [item.description]
    const searchableText = [item.name, ...item.author, ...item.tags, ...descriptions]
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
  <AddonGalleryFilters v-model:keyword="keyword" v-model:kind="kind" :counts="counts" />

  <p class="addon-gallery-summary" role="status" aria-live="polite">
    {{ t('gallery.results', { count: filteredAddons.length, total: normalizedAddons.length }) }}
  </p>

  <ul v-if="filteredAddons.length" class="addon-gallery-grid">
    <li v-for="addon in filteredAddons" :key="addon.name" class="w-full list-none m-0!">
      <AddonGalleryCard :addon="addon" @tag-click="handleTagClick" />
    </li>
  </ul>

  <div v-else class="addon-gallery-empty">
    <span class="i-ri-search-eye-line addon-gallery-empty-icon" aria-hidden="true" />
    <p class="addon-gallery-empty-title">
      {{ t('gallery.noResults') }}
    </p>
    <p class="addon-gallery-empty-hint">
      {{ t('gallery.noResultsHint') }}
    </p>
    <button v-if="hasActiveFilters" type="button" class="addon-gallery-reset" @click="clearFilters">
      {{ t('gallery.clearFilters') }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.addon-gallery-summary {
  margin: 0 0 0.875rem;
  color: var(--va-c-text-3);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.addon-gallery-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  margin: 0 !important;
  padding: 0 !important;
}

.addon-gallery-empty {
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

.addon-gallery-empty-icon {
  color: var(--va-c-text-3);
  font-size: 2rem;
}

.addon-gallery-empty-title {
  margin: 0.75rem 0 0;
  color: var(--va-c-text);
  font-weight: 600;
}

.addon-gallery-empty-hint {
  max-width: 28rem;
  margin: 0.35rem 0 1rem;
  color: var(--va-c-text-3);
  font-size: 0.875rem;
}

.addon-gallery-reset {
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
  .addon-gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
