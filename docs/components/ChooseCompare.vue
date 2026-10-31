<script lang="ts" setup>
import type { ChooseFacetId, ChooseFrameworkId } from '../data/choose-compare'
import { computed, nextTick, shallowRef, useId, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { chooseCompare, chooseFrameworkMark } from '../data/choose-compare'

const props = defineProps<{
  lang: 'en' | 'zh'
}>()

const copy = computed(() => chooseCompare[props.lang])
const focus = shallowRef<ChooseFrameworkId | 'all'>('valaxy')
const facet = shallowRef<ChooseFacetId>('fit')
const lineCursor = shallowRef<ChooseFrameworkId>('hexo')
const uid = useId()
const activeFacet = computed(() => {
  const match = copy.value.facets.find(item => item.id === facet.value)
  if (match)
    return match
  const first = copy.value.facets[0]
  if (!first)
    throw new Error('Choose comparison is missing its rows')
  return first
})
const active = computed(() => copy.value.frameworks.find(item => item.id === focus.value) ?? null)
const extraFacets = computed(() => copy.value.facets.filter(item => item.id !== 'fit'))
const otherFrameworks = computed(() => copy.value.frameworks.filter(item => item.id !== focus.value))
const facetSummaryText = computed(() => {
  const label = activeFacet.value.label
  return props.lang === 'zh'
    ? `${copy.value.facetSummary}${label}`
    : `${copy.value.facetSummary} ${label}`
})

function tabDomId(id: string) {
  return `${uid}-tab-${id}`
}

function panelDomId(id: string) {
  return `${uid}-panel-${id}`
}

function facetDomId(id: string) {
  return `${uid}-facet-${id}`
}

function lineDomId(id: string) {
  return `${uid}-line-${id}`
}

function accentStyle(id: ChooseFrameworkId) {
  return { '--choose-accent': chooseFrameworkMark[id].color }
}

function parts(text: string) {
  return text.split(/(`[^`]+`)/).filter(Boolean).map(part =>
    part.startsWith('`') && part.endsWith('`')
      ? { code: part.slice(1, -1) }
      : { text: part },
  )
}

function lineOrder(): ChooseFrameworkId[] {
  const ids = copy.value.frameworks.map(item => item.id)
  if (focus.value === 'all')
    return ids
  return ids.filter(id => id !== focus.value)
}

watch(focus, (value) => {
  if (value === 'all') {
    lineCursor.value = 'valaxy'
    return
  }
  const order = lineOrder()
  if (!order.includes(lineCursor.value))
    lineCursor.value = order[0] ?? 'valaxy'
})

function pick<T>(order: T[], current: T, key: string): T | undefined {
  if (order.length === 0)
    return
  if (key === 'Home')
    return order[0]
  if (key === 'End')
    return order.at(-1)
  const forward = key === 'ArrowRight' || key === 'ArrowDown'
  const backward = key === 'ArrowLeft' || key === 'ArrowUp'
  if (!forward && !backward)
    return
  const index = Math.max(0, order.indexOf(current))
  const delta = forward ? 1 : -1
  return order[(index + delta + order.length) % order.length]
}

function arrowKey(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey)
    return
  return event.key
}

async function focusTab(id: ChooseFrameworkId | 'all') {
  focus.value = id
  await nextTick()
  document.getElementById(tabDomId(id))?.focus()
}

async function selectFacet(id: ChooseFacetId) {
  facet.value = id
  await nextTick()
  document.getElementById(facetDomId(id))?.focus()
}

async function moveLine(id: ChooseFrameworkId) {
  lineCursor.value = id
  await nextTick()
  document.getElementById(lineDomId(id))?.focus()
}

function onTabsKeydown(event: KeyboardEvent) {
  const key = arrowKey(event)
  if (!key)
    return
  const order: Array<ChooseFrameworkId | 'all'> = ['all', ...copy.value.frameworks.map(item => item.id)]
  const next = pick(order, focus.value, key)
  if (!next)
    return
  event.preventDefault()
  void focusTab(next)
}

function onFacetsKeydown(event: KeyboardEvent) {
  const key = arrowKey(event)
  if (!key)
    return
  const next = pick(copy.value.facets.map(item => item.id), facet.value, key)
  if (!next)
    return
  event.preventDefault()
  void selectFacet(next)
}

function onLinesKeydown(event: KeyboardEvent) {
  const key = arrowKey(event)
  if (!key)
    return
  const next = pick(lineOrder(), lineCursor.value, key)
  if (!next)
    return
  event.preventDefault()
  void moveLine(next)
}
</script>

<template>
  <div class="choose-compare">
    <div
      class="choose-compare-tabs"
      role="tablist"
      aria-orientation="horizontal"
      :aria-label="copy.groupLabel"
      @keydown="onTabsKeydown"
    >
      <button
        :id="tabDomId('all')"
        type="button"
        role="tab"
        class="choose-compare-chip"
        :class="{ 'is-active': focus === 'all' }"
        :aria-selected="focus === 'all'"
        :aria-controls="panelDomId('all')"
        :tabindex="focus === 'all' ? 0 : -1"
        @click="focus = 'all'"
      >
        {{ copy.all }}
      </button>
      <button
        v-for="fw in copy.frameworks"
        :id="tabDomId(fw.id)"
        :key="fw.id"
        type="button"
        role="tab"
        class="choose-compare-chip"
        :class="{ 'is-active': focus === fw.id }"
        :style="accentStyle(fw.id)"
        :aria-selected="focus === fw.id"
        :aria-controls="panelDomId(fw.id)"
        :tabindex="focus === fw.id ? 0 : -1"
        @click="focus = fw.id"
      >
        <span class="choose-compare-glyph" :class="chooseFrameworkMark[fw.id].icon" aria-hidden="true" />
        {{ fw.name }}<span v-if="fw.id === 'valaxy'" class="sr-only">, {{ copy.recommended }}</span>
      </button>
    </div>

    <div
      v-if="active"
      :id="panelDomId(active.id)"
      role="tabpanel"
      :aria-labelledby="tabDomId(active.id)"
    >
      <article
        class="choose-compare-card"
        :style="accentStyle(active.id)"
      >
        <h3 class="choose-compare-card-title">
          <span class="choose-compare-glyph" :class="chooseFrameworkMark[active.id].icon" aria-hidden="true" />
          <RouterLink v-if="!active.external" :to="active.href">
            {{ active.name }}
          </RouterLink>
          <a v-else :href="active.href" target="_blank" rel="noopener noreferrer">
            {{ active.name }}
            <span class="i-ri-external-link-line choose-compare-external" aria-hidden="true" />
            <span class="sr-only">({{ copy.external }})</span>
          </a>
        </h3>
        <p class="choose-compare-fit">
          {{ active.points.fit }}
        </p>
        <details class="choose-compare-disclosure choose-compare-rows">
          <summary>{{ copy.moreRows }}</summary>
          <dl class="choose-compare-dl">
            <template v-for="item in extraFacets" :key="item.id">
              <dt>{{ item.label }}</dt>
              <dd>
                <template v-for="(part, index) in parts(active.points[item.id])" :key="index">
                  <code v-if="part.code">{{ part.code }}</code>
                  <span v-else>{{ part.text }}</span>
                </template>
              </dd>
            </template>
          </dl>
        </details>
      </article>

      <details class="choose-compare-disclosure">
        <summary>{{ copy.othersSummary }}</summary>
        <div
          class="choose-compare-list"
          role="group"
          :aria-label="copy.linesLabel"
          @keydown="onLinesKeydown"
        >
          <button
            v-for="fw in otherFrameworks"
            :id="lineDomId(fw.id)"
            :key="fw.id"
            type="button"
            class="choose-compare-line"
            :style="accentStyle(fw.id)"
            :tabindex="lineCursor === fw.id ? 0 : -1"
            @click="focusTab(fw.id)"
            @focus="lineCursor = fw.id"
          >
            <span class="choose-compare-line-name">
              <span class="choose-compare-glyph" :class="chooseFrameworkMark[fw.id].icon" aria-hidden="true" />
              {{ fw.name }}
            </span>
            <span class="choose-compare-value">{{ fw.points.fit }}</span>
          </button>
        </div>
      </details>
    </div>

    <div
      v-else
      :id="panelDomId('all')"
      role="tabpanel"
      class="choose-compare-all"
      :aria-labelledby="tabDomId('all')"
    >
      <details class="choose-compare-disclosure">
        <summary>{{ facetSummaryText }}</summary>
        <div
          class="choose-compare-facets"
          role="radiogroup"
          :aria-label="copy.facetGroup"
          @keydown="onFacetsKeydown"
        >
          <button
            v-for="item in copy.facets"
            :id="facetDomId(item.id)"
            :key="item.id"
            type="button"
            role="radio"
            class="choose-compare-facet"
            :class="{ 'is-active': facet === item.id }"
            :aria-checked="facet === item.id"
            :tabindex="facet === item.id ? 0 : -1"
            @click="facet = item.id"
          >
            {{ item.label }}
          </button>
        </div>
      </details>

      <div
        class="choose-compare-list"
        role="group"
        :aria-label="copy.linesLabel"
        @keydown="onLinesKeydown"
      >
        <button
          v-for="fw in copy.frameworks"
          :id="lineDomId(fw.id)"
          :key="fw.id"
          type="button"
          class="choose-compare-line"
          :class="{ 'is-home': fw.id === 'valaxy' }"
          :style="accentStyle(fw.id)"
          :tabindex="lineCursor === fw.id ? 0 : -1"
          @click="focusTab(fw.id)"
          @focus="lineCursor = fw.id"
        >
          <span class="choose-compare-line-name">
            <span class="choose-compare-glyph" :class="chooseFrameworkMark[fw.id].icon" aria-hidden="true" />
            {{ fw.name }}<span v-if="fw.id === 'valaxy'" class="sr-only">, {{ copy.recommended }}</span>
          </span>
          <span class="choose-compare-value">
            <template v-for="(part, index) in parts(fw.points[activeFacet.id])" :key="index">
              <code v-if="part.code">{{ part.code }}</code>
              <span v-else>{{ part.text }}</span>
            </template>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.choose-compare {
  container-type: inline-size;
  margin: 1rem 0 1.5rem;
  color: var(--pr-c-text-1);
  font-size: 0.875rem;
  line-height: 1.45;
}

.choose-compare-tabs,
.choose-compare-facets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.choose-compare-tabs {
  margin-bottom: 0.75rem;
}

.choose-compare-chip,
.choose-compare-facet,
.choose-compare-line {
  border: 1px solid var(--pr-c-divider-light);
  background: var(--pr-c-bg);
  color: var(--pr-c-text-2);
  font: inherit;
  cursor: pointer;
}

.choose-compare-chip,
.choose-compare-facet {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-weight: 600;
}

.choose-compare-chip.is-active::before,
.choose-compare-facet.is-active::before {
  content: '';
  width: 0.375rem;
  height: 0.375rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--choose-accent, var(--pr-c-brand));
}

.choose-compare-glyph {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  color: var(--choose-accent);
}

.choose-compare-facet {
  padding: 0.28rem 0.7rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.choose-compare-chip.is-active,
.choose-compare-facet.is-active {
  border-color: var(--choose-accent, var(--pr-c-brand));
  background: color-mix(in srgb, var(--choose-accent, var(--pr-c-brand)) 14%, var(--pr-c-bg));
  color: var(--pr-c-text-1);
  box-shadow: inset 0 0 0 1px var(--choose-accent, var(--pr-c-brand));
}

.choose-compare-chip:focus-visible,
.choose-compare-facet:focus-visible,
.choose-compare-line:focus-visible,
.choose-compare-disclosure summary:focus-visible,
.choose-compare a:focus-visible {
  outline: 2px solid var(--pr-c-brand);
  outline-offset: 2px;
}

.choose-compare-disclosure {
  margin: 0.75rem 0 0;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 0.75rem;
  background: var(--pr-c-bg);
}

.choose-compare-disclosure summary {
  padding: 0.55rem 0.85rem;
  color: var(--pr-c-text-1);
  font-weight: 600;
  cursor: pointer;
}

.choose-compare-disclosure[open] > summary {
  border-bottom: 1px solid var(--pr-c-divider-light);
}

.choose-compare-rows {
  margin-top: 0.85rem;
  border-right: 0;
  border-bottom: 0;
  border-left: 0;
  border-radius: 0;
  background: transparent;
}

.choose-compare-facets {
  margin: 0.7rem 0.75rem 0.75rem;
}

.choose-compare-list {
  overflow: hidden;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 0.9rem;
  background: var(--pr-c-bg);
}

.choose-compare-all .choose-compare-list {
  margin-top: 0.75rem;
}

.choose-compare-disclosure .choose-compare-list {
  border: 0;
  border-radius: 0;
}

.choose-compare-line {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  gap: 0.35rem 0.85rem;
  align-items: center;
  width: 100%;
  border-width: 0 0 1px;
  border-radius: 0;
  padding: 0.7rem 0.9rem;
  background: var(--pr-c-bg);
  box-shadow: inset 3px 0 0 var(--choose-accent);
  color: var(--pr-c-text-1);
  text-align: left;
}

.choose-compare-line:last-child {
  border-bottom-width: 0;
}

.choose-compare-line.is-home {
  background: color-mix(in srgb, var(--choose-accent) 10%, var(--pr-c-bg));
}

.choose-compare-line:hover,
.choose-compare-line:focus-visible {
  background: color-mix(in srgb, var(--choose-accent) 8%, var(--pr-c-bg));
}

.choose-compare-line-name {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  color: var(--pr-c-text-1);
  font-weight: 700;
}

.choose-compare code {
  border-radius: 0.25rem;
  padding: 0.05em 0.3em;
  background: var(--va-c-default-soft);
  font-size: 0.85em;
}

.choose-compare-card {
  border: 1px solid color-mix(in srgb, var(--choose-accent) 42%, var(--pr-c-divider-light));
  border-radius: 1rem;
  padding: 1rem 1.05rem 1.1rem;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--choose-accent) 14%, transparent), transparent 4.25rem),
    var(--pr-c-bg);
  box-shadow: inset 3px 0 0 var(--choose-accent);
}

.choose-compare-card-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  color: var(--pr-c-text-1);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.choose-compare-card-title .choose-compare-glyph {
  width: 1.35rem;
  height: 1.35rem;
}

.choose-compare-fit {
  margin: 0.4rem 0 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.45;
}

.choose-compare-dl {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  gap: 0.45rem 0.75rem;
  margin: 0;
  padding: 0.75rem 0.9rem 0.9rem;
}

.choose-compare-dl dt {
  margin: 0;
  color: var(--pr-c-text-2);
  font-weight: 700;
}

.choose-compare-dl dd {
  margin: 0;
}

.choose-compare-external {
  display: inline-block;
  margin-left: 0.3rem;
  font-size: 0.85em;
  vertical-align: -0.05em;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@container (max-width: 24rem) {
  .choose-compare-line,
  .choose-compare-dl {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }

  .choose-compare-dl dd {
    margin-bottom: 0.45rem;
  }
}
</style>
