<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { computed, nextTick, shallowRef, useTemplateRef } from 'vue'

const props = defineProps<{
  copy: {
    label: string
    placeholder: string
    submit: string
    printed: string
    tray: string
  }
}>()

const reducedMotion = usePreferredReducedMotion()

/** The case: forty sorts, Chinese and Latin, cast from the words on this page. */
const TRAY = [...'你好世界文字星系为书写而生向自由进一篇博客今天也了日常故事灵感长VueMd#*>']
const MAX = 12

const press = useTemplateRef<HTMLElement>('press')
const title = shallowRef('')
const stick = shallowRef<{ ch: string, landed: boolean }[]>([])
const printed = shallowRef('')
const editions = shallowRef(0)
const busy = shallowRef(false)
const pressing = shallowRef(false)
// Local calendar date, YYYY-MM-DD.
const date = new Date().toLocaleDateString('sv-SE')

const colophon = computed(() => props.copy.printed.replace('{n}', String(editions.value)).replace('{date}', date))

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function relativeRect(el: Element) {
  const base = press.value!.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  return { x: rect.left - base.left, y: rect.top - base.top, w: rect.width, h: rect.height }
}

async function print() {
  // Spaces are set as quads: blank sorts that keep words apart on the sheet.
  const text = [...(title.value.trim() || props.copy.placeholder)].slice(0, MAX)
  if (!text.length || busy.value || !press.value)
    return
  busy.value = true
  stick.value = text.map(ch => ({ ch, landed: !ch.trim() }))
  await nextTick()

  if (reducedMotion.value !== 'reduce') {
    const cells = [...press.value.querySelectorAll<HTMLElement>('.tray-sort')]
    const slots = [...press.value.querySelectorAll<HTMLElement>('.stick-sort')]
    const layer = press.value.querySelector<HTMLElement>('.press-flights')!
    // Pick each sort from the case — the matching one when the case has it.
    await Promise.all(text.map(async (ch, i) => {
      if (!ch.trim())
        return
      const cell = cells.find(c => c.dataset.ch === ch) ?? cells[(i * 7) % cells.length]
      const from = relativeRect(cell)
      const to = relativeRect(slots[i])
      const sort = document.createElement('span')
      sort.className = 'is-flying'
      // WAAPI owns the outer transform, so the glyph is mirrored on an inner element.
      const glyph = document.createElement('i')
      glyph.textContent = ch
      sort.append(glyph)
      const scale = to.w / from.w
      sort.style.cssText = `left:${from.x}px;top:${from.y}px;width:${from.w}px;height:${from.h}px`
      layer.append(sort)
      await sort.animate([
        { transform: 'translate(0, 0) scale(1)' },
        { transform: `translate(${(to.x - from.x) / 2}px, ${(to.y - from.y) / 2 - 40}px) scale(1.12)`, offset: 0.5 },
        { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(${scale})` },
      ], { duration: 520, delay: i * 70, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }).finished
      stick.value[i] = { ch, landed: true }
      stick.value = [...stick.value]
      sort.remove()
    }))
    await wait(160)
    // The platen comes down on the forme; the impression appears as it lifts.
    pressing.value = true
    await wait(260)
  }

  printed.value = text.join('')
  editions.value++
  if (reducedMotion.value !== 'reduce') {
    await wait(220)
    pressing.value = false
    await wait(500)
  }
  stick.value = stick.value.map(sort => ({ ...sort, landed: true }))
  busy.value = false
}
</script>

<template>
  <div ref="press" class="type-press" :class="{ 'is-pressing': pressing }">
    <svg class="ink-filter" aria-hidden="true" width="0" height="0">
      <!-- Rough, slightly spread edges, as ink takes on uneven paper. -->
      <filter id="release-ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="1.6" />
      </filter>
    </svg>

    <div class="type-case" role="img" :aria-label="copy.tray">
      <span v-for="(ch, index) in TRAY" :key="index" class="sort tray-sort" :data-ch="ch">{{ ch }}</span>
    </div>

    <div class="type-stick" aria-hidden="true">
      <span
        v-for="(sort, index) in stick"
        :key="index"
        class="sort stick-sort"
        :class="{ 'is-landed': sort.landed, 'is-quad': !sort.ch.trim() }"
      >{{ sort.ch }}</span>
      <span class="platen" />
    </div>

    <form class="type-form" @submit.prevent="print">
      <label for="release-type-title">{{ copy.label }}</label>
      <div class="type-row">
        <input
          id="release-type-title"
          v-model="title"
          type="text"
          :maxlength="MAX"
          autocomplete="off"
          :placeholder="copy.placeholder"
        >
        <button type="submit" :disabled="busy">
          {{ copy.submit }}
        </button>
      </div>
    </form>

    <div class="type-sheet" aria-live="polite">
      <p v-if="printed" :key="editions" class="impression">
        {{ printed }}
      </p>
      <p v-if="printed" class="colophon">
        {{ colophon }}
      </p>
    </div>

    <div class="press-flights" aria-hidden="true" />
  </div>
</template>

<style scoped>
.type-press {
  --ink: #13235e;
  --case: #0a1a4f;
  --lead: #c7cdd9;
  --lead-face: #dde2eb;

  position: relative;
  display: grid;
  gap: 18px;
  padding: 24px;
  border-radius: 6px;
  background: var(--case);
}

.ink-filter {
  position: absolute;
}

.sort {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #98a1b4;
  border-radius: 2px;
  color: var(--ink);
  background: var(--lead-face);
  box-shadow: inset 0 -3px 0 var(--lead);
  font-family: "LXGW WenKai Screen", Literata, serif;
  font-size: 18px;
  line-height: 1;

  /* Type is cast in reverse, so it reads correctly once printed. */
  transform: scaleX(-1);
}

/* The nick: the groove a compositor feels for to keep every sort the right way up. */
.sort::after {
  content: '';
  position: absolute;
  right: 18%;
  bottom: 5px;
  left: 18%;
  height: 1px;
  background: #98a1b4;
}

.type-case {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 6px;
}

.type-stick {
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 4px;
  min-height: 52px;
  padding: 6px;
  border: 1px solid rgb(255 255 255 / 0.28);
  border-radius: 3px;
  overflow: hidden;
}

.stick-sort {
  opacity: 0;
}

.stick-sort.is-landed {
  opacity: 1;
}

/* A quad is cast lower than type height, so it never prints. */
.stick-sort.is-quad {
  opacity: 1;
  box-shadow: none;
  background: var(--lead);
  transform: scale(0.82);
}

.stick-sort.is-quad::after {
  content: none;
}

.platen {
  position: absolute;
  inset: 0;
  background: #eef3ff;
  transform: translateY(-105%);
  transition: transform 240ms cubic-bezier(0.55, 0, 0.45, 1);
}

.is-pressing .platen {
  transform: none;
}

.press-flights {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.press-flights :deep(.is-flying) {
  position: absolute;
  z-index: 2;
  display: grid;
  place-items: center;
  border: 1px solid #98a1b4;
  border-radius: 2px;
  color: var(--ink);
  background: var(--lead-face);
  box-shadow: inset 0 -3px 0 var(--lead), 0 10px 18px rgb(4 12 40 / 0.4);
  font-family: "LXGW WenKai Screen", Literata, serif;
  font-size: 18px;
  transform-origin: 0 0;
}

.press-flights :deep(.is-flying i) {
  font-style: normal;
  transform: scaleX(-1);
}

.type-form label {
  display: block;
  margin-bottom: 8px;
  color: rgb(255 255 255 / 0.78);
  font-size: 15px;
}

.type-row {
  display: flex;
  gap: 8px;
}

.type-row input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border: 1px solid rgb(255 255 255 / 0.28);
  border-radius: 4px;
  color: #fff;
  background: rgb(255 255 255 / 0.06);
  font: inherit;
  font-size: 16px;
}

.type-row input::placeholder {
  color: rgb(255 255 255 / 0.42);
}

.type-row button {
  flex: none;
  height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 4px;
  color: var(--case);
  background: #eef3ff;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
}

.type-row button:disabled {
  opacity: 0.6;
}

.type-press :focus-visible {
  outline: 2px solid #c9a7ff;
  outline-offset: 3px;
}

.type-sheet {
  display: grid;
  align-content: center;
  min-height: 150px;
  padding: 28px 30px;
  border-radius: 3px;
  color: var(--ink);
  background: #fbfcff;
}

.impression {
  margin: 0;
  font-family: "LXGW WenKai Screen", Literata, serif;
  font-size: clamp(30px, 3.4vw, 46px);
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
  filter: url("#release-ink");

  /* A faint deboss: light catches the lower edge of the bitten paper. */
  text-shadow: 0 1px 0 rgb(255 255 255 / 0.9), 0 -1px 0 rgb(19 35 94 / 0.12);
}

.colophon {
  margin: 14px 0 0;
  color: rgb(19 35 94 / 0.62);
  font-size: 14px;
}

@media (prefers-reduced-motion: no-preference) {
  .impression {
    animation: type-impress 520ms cubic-bezier(0.22, 1, 0.36, 1);
  }
}

@keyframes type-impress {
  from {
    opacity: 0;
    transform: scale(1.03);
  }
}

@media (width <= 600px) {
  .type-press {
    padding: 16px;
  }

  .type-case {
    gap: 4px;
  }

  .sort {
    font-size: 14px;
  }
}
</style>
