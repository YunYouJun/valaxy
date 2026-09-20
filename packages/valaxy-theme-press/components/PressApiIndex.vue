<script setup lang="ts">
import type { ApiIndexGroup } from '../utils/api-index'
import { computed, onMounted, shallowRef, useId } from 'vue'
import { filterApiGroups } from '../utils/api-index'

const props = withDefaults(defineProps<{
  groups: ApiIndexGroup[]
  label?: string
  placeholder?: string
  emptyText?: string
  allText?: string
  clearText?: string
  resultsText?: string
}>(), {
  label: 'Filter APIs',
  placeholder: 'Search by name or category',
  emptyText: 'No matching APIs.',
  allText: 'All modules',
  clearText: 'Clear filters',
  resultsText: 'APIs',
})
const query = shallowRef('')
const ready = shallowRef(false)
onMounted(() => ready.value = true)
const module = shallowRef('')
const inputId = useId()
const modules = computed(() => [...new Set(props.groups.map(group => group.module).filter((name): name is string => !!name))])
const filtered = computed(() => filterApiGroups(props.groups, query.value, module.value))
const count = computed(() => filtered.value.reduce((total, group) => total + group.items.length, 0))
const sections = computed(() => [...new Set(filtered.value.map(group => group.module || ''))].map(name => ({
  name,
  groups: filtered.value.filter(group => (group.module || '') === name),
})))
function clear() {
  query.value = ''
  module.value = ''
}
</script>

<template>
  <div class="press-api-index not-prose">
    <div class="api-filter">
      <label :for="inputId" class="api-filter-label">{{ label }}</label>
      <div class="api-search-field">
        <span class="api-search-icon" aria-hidden="true">⌕</span>
        <input :id="inputId" v-model="query" :disabled="!ready" type="search" class="api-filter-input" :placeholder="placeholder" autocomplete="off" spellcheck="false">
      </div>
      <span class="api-result-count" role="status" aria-live="polite">{{ count }} {{ resultsText }}</span>
    </div>
    <div v-if="modules.length > 1" class="api-module-filter" role="group" :aria-label="allText">
      <button type="button" :disabled="!ready" :aria-pressed="!module" @click="module = ''">
        {{ allText }}
      </button>
      <button v-for="name in modules" :key="name" type="button" :disabled="!ready" :aria-pressed="module === name" @click="module = name">
        {{ name }}
      </button>
    </div>
    <section v-for="section in sections" :key="section.name" class="api-module">
      <h2 v-if="section.name" class="api-module-title">
        {{ section.name }}
      </h2>
      <div class="api-groups">
        <section v-for="group in section.groups" :key="group.title" class="api-group">
          <h3 class="api-group-title">
            {{ group.title }} <span>{{ group.items.length }}</span>
          </h3>
          <ul class="api-items">
            <li v-for="item in group.items" :key="item.link" class="api-item">
              <AppLink :to="item.link" class="api-link">
                {{ item.text }}
              </AppLink>
            </li>
          </ul>
        </section>
      </div>
    </section>
    <div v-if="!filtered.length" class="api-empty">
      <p>{{ emptyText }}</p>
      <button type="button" class="api-clear" @click="clear">
        {{ clearText }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.press-api-index { margin-top: 1.5rem; }
.api-filter { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.api-filter-label { width: 100%; font-size: 0.875rem; font-weight: 600; }
.api-search-field { display: flex; align-items: center; flex: 1; min-width: 0; border: 1px solid var(--pr-c-divider-light); border-radius: 8px; background: var(--pr-c-surface); }
.api-search-icon { padding-left: 0.875rem; font-size: 1.5rem; color: var(--pr-c-text-2); }
.api-filter-input { width: 100%; min-width: 0; padding: 0.75rem; background: transparent; color: var(--pr-c-text-1); font: inherit; font-size: 1rem; }
.api-search-field:focus-within { outline: 2px solid var(--pr-c-brand); outline-offset: 2px; }
.api-filter-input:focus { outline: none; }
.api-result-count { font-size: 0.75rem; color: var(--pr-c-text-2); font-variant-numeric: tabular-nums; }
.api-module-filter { display: flex; gap: 0.375rem; flex-wrap: wrap; margin: 1rem 0 2.5rem; }
.api-module-filter button { padding: 0.375rem 0.875rem; border-radius: 6px; color: var(--pr-c-text-2); font-size: 0.8125rem; cursor: pointer; }
.api-module-filter button[aria-pressed="true"] { background: var(--pr-c-brand-soft); color: var(--pr-c-brand); font-weight: 600; }
.api-module-filter button:hover { color: var(--pr-c-brand); }
.api-module + .api-module { margin-top: 3rem; }
.press-api-index .api-module-title { margin: 0 0 1.25rem; padding: 0 0 0.75rem; border: 0; border-bottom: 1px solid var(--pr-c-divider-light); color: var(--pr-c-text-1); font-size: 1.5rem; font-family: var(--pr-font-mono); letter-spacing: -0.03em; }
.api-groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 1.75rem; align-items: start; }
.press-api-index .api-group-title { margin: 0 0 0.625rem; padding: 0; border: 0; font-size: 0.875rem; font-weight: 600; color: var(--pr-c-text-2); letter-spacing: 0; }
.api-group-title span { margin-left: 0.375rem; font-weight: 400; font-size: 0.75rem; }
.api-items { padding: 0; margin: 0; list-style: none; }
.api-item { margin: 0; overflow-wrap: anywhere; }
.api-link { display: block; padding: 0.25rem 0; color: var(--pr-c-brand); font-size: 0.8125rem; line-height: 1.65; font-family: var(--pr-font-mono); }
.api-empty { padding: 2rem 0; color: var(--pr-c-text-2); }
.api-clear { margin-top: 1rem; color: var(--pr-c-brand); text-decoration: underline; cursor: pointer; }
@media (width < 640px) { .api-result-count { width: 100%; } }
</style>
