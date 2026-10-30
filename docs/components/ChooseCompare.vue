<script lang="ts" setup>
import type { ChooseFacetId, ChooseFrameworkId } from '../data/choose-compare'
import { computed, nextTick, shallowRef, useId } from 'vue'
import { RouterLink } from 'vue-router'
import { chooseCompare, chooseFrameworkMark } from '../data/choose-compare'

const props = defineProps<{
  lang: 'en' | 'zh'
}>()

const copy = computed(() => chooseCompare[props.lang])
const focus = shallowRef<ChooseFrameworkId | 'all'>('all')
const facet = shallowRef<ChooseFacetId>('fit')
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
const details = computed(() => copy.value.facets.filter(facet => facet.id !== 'fit'))

function tabDomId(id: string) {
  return `${uid}-tab-${id}`
}

function panelDomId(id: string) {
  return `${uid}-panel-${id}`
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

async function focusTab(id: ChooseFrameworkId | 'all') {
  focus.value = id
  await nextTick()
  document.getElementById(tabDomId(id))?.focus()
}

function onTabsKeydown(event: KeyboardEvent) {
  const order: Array<ChooseFrameworkId | 'all'> = ['all', ...copy.value.frameworks.map(item => item.id)]
  const index = order.indexOf(focus.value)
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault()
    const delta = event.key === 'ArrowRight' ? 1 : -1
    const next = order[(index + delta + order.length) % order.length] ?? 'all'
    void focusTab(next)
  }
  else if (event.key === 'Home') {
    event.preventDefault()
    void focusTab('all')
  }
  else if (event.key === 'End') {
    event.preventDefault()
    void focusTab(order.at(-1) ?? 'all')
  }
}
</script>

<template>
  <div class="choose-compare">
    <div
      class="choose-compare-tabs"
      role="tablist"
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
        {{ fw.name }}
      </button>
    </div>

    <div
      v-if="!active"
      class="choose-compare-facets"
      role="group"
      :aria-label="copy.facetGroup"
    >
      <button
        v-for="item in copy.facets"
        :key="item.id"
        type="button"
        class="choose-compare-facet"
        :class="{ 'is-active': facet === item.id }"
        :aria-pressed="facet === item.id"
        @click="facet = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <article
      v-if="active"
      :id="panelDomId(active.id)"
      role="tabpanel"
      :aria-labelledby="tabDomId(active.id)"
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
      <dl class="choose-compare-dl">
        <template v-for="item in details" :key="item.id">
          <dt>{{ item.label }}</dt>
          <dd>
            <template v-for="(part, index) in parts(active.points[item.id])" :key="index">
              <code v-if="part.code">{{ part.code }}</code>
              <span v-else>{{ part.text }}</span>
            </template>
          </dd>
        </template>
      </dl>
    </article>

    <div
      v-else
      :id="panelDomId('all')"
      role="tabpanel"
      class="choose-compare-list"
      :aria-labelledby="tabDomId('all')"
    >
      <button
        v-for="fw in copy.frameworks"
        :key="fw.id"
        type="button"
        class="choose-compare-line"
        :class="{ 'is-home': fw.id === 'valaxy' }"
        :style="accentStyle(fw.id)"
        @click="focus = fw.id"
      >
        <span class="choose-compare-line-name">
          <span class="choose-compare-glyph" :class="chooseFrameworkMark[fw.id].icon" aria-hidden="true" />
          {{ fw.name }}
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
}

.choose-compare-chip:focus-visible,
.choose-compare-facet:focus-visible,
.choose-compare-line:focus-visible,
.choose-compare a:focus-visible {
  outline: 2px solid var(--pr-c-brand);
  outline-offset: 2px;
}

.choose-compare-list {
  overflow: hidden;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 0.9rem;
  background: var(--pr-c-bg);
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

.choose-compare-line:hover {
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
  margin: 0.4rem 0 0.9rem;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.45;
}

.choose-compare-dl {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  gap: 0.45rem 0.75rem;
  margin: 0;
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
