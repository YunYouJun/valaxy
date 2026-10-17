<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import { useDocumentVisibility, useElementVisibility, usePreferredReducedMotion } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { localizeTheme, themes } from '../../data/themes'
import ReleaseV1Planet from './ReleaseV1Planet.vue'

const props = defineProps<{ copy: ReleaseCopy['themes'], prefix: string }>()
const locale = computed(() => props.prefix === '/zh' ? 'zh-CN' : 'en')

type Kind = 'yun' | 'press' | 'arknights' | 'shuimo' | 'sakura' | 'antfu'

/**
 * Each planet is a real Valaxy theme. Its skin is the theme's own palette and
 * type, applied to the whole section when the planet is chosen.
 */
const planets = ([
  { id: 'yun', label: 'Yun', image: '/release/yun-preview.webp', example: 'https://yun.valaxy.site/', orbit: 0, phase: 0.12, skin: { bg: '#f2f6fc', ink: '#1f2f4a', accent: '#0078e7', font: '"LXGW WenKai Screen", system-ui, sans-serif' } },
  { id: 'press', label: 'Press', image: '/release/press-preview.webp', example: 'https://valaxy.site/', orbit: 0, phase: 0.62, skin: { bg: '#ffffff', ink: '#1d1d1f', accent: '#7c3aed', font: 'system-ui, sans-serif' } },
  { id: 'arknights', label: 'Arknights', image: '/themes/arknights-preview.webp', example: 'https://arknights.valaxy.site/', orbit: 1, phase: 0.32, skin: { bg: '#18191c', ink: '#ececec', accent: '#ffd338', font: '"Maple Mono", ui-monospace, monospace' } },
  { id: 'shuimo', label: 'Shuimo', example: '', orbit: 1, phase: 0.82, skin: { bg: '#f1efe9', ink: '#262626', accent: '#a33a2b', font: '"LXGW WenKai Screen", serif' } },
  { id: 'sakura', label: 'Sakura', example: '', orbit: 2, phase: 0.18, skin: { bg: '#fff3f6', ink: '#4a2a36', accent: '#e0507a', font: 'system-ui, sans-serif' } },
  { id: 'antfu', label: 'antfu', example: '', orbit: 2, phase: 0.58, skin: { bg: '#fafafa', ink: '#4b4b4b', accent: '#111111', font: 'Literata, Georgia, serif' } },
] as const).map((planet) => {
  const theme = themes.find(t => t.name === `valaxy-theme-${planet.id}`)!
  return {
    ...planet,
    kind: planet.id as Kind,
    theme,
    // Screenshots are self-hosted so the card never depends on another site.
    image: 'image' in planet ? planet.image : `/release/themes/${planet.id}.webp`,
    example: planet.example || theme.siteExampleUrl || theme.repo,
  }
})

/** Orbit radii as a share of the instrument's width; periods in seconds. */
const ORBITS = [
  { rx: 0.25, period: 34 },
  { rx: 0.36, period: 52 },
  { rx: 0.47, period: 76 },
]
const FLATTEN = 0.42
/** The instrument is drawn in a 100 × 64 box. */
const VIEW_H = 64
const CY = VIEW_H / 2
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5)

const section = useTemplateRef<HTMLElement>('section')
const selectedId = shallowRef<Kind>('yun')
const wiping = shallowRef(false)
const selected = computed(() => {
  const planet = planets.find(p => p.id === selectedId.value)!
  return { ...planet, info: localizeTheme(planet.theme, locale.value) }
})
const skin = computed(() => ({
  '--skin-bg': selected.value.skin.bg,
  '--skin-ink': selected.value.skin.ink,
  '--skin-accent': selected.value.skin.accent,
  '--skin-font': selected.value.skin.font,
}))

// Planets move by rAF so they stay clickable buttons. The orbit rests under
// the pointer or focus, and can be turned by hand.
const orrery = useTemplateRef<HTMLElement>('orrery')
const visible = useElementVisibility(orrery)
const documentVisibility = useDocumentVisibility()
const reducedMotion = usePreferredReducedMotion()
const held = shallowRef(false)
const elapsed = shallowRef(0)
let frame = 0
let last = 0

function tick(now: number) {
  if (last)
    elapsed.value += (now - last) / 1000
  last = now
  frame = requestAnimationFrame(tick)
}

function sync() {
  cancelAnimationFrame(frame)
  last = 0
  if (visible.value && documentVisibility.value === 'visible' && reducedMotion.value !== 'reduce' && !held.value)
    frame = requestAnimationFrame(tick)
}

onMounted(sync)
onBeforeUnmount(() => cancelAnimationFrame(frame))
watch([visible, documentVisibility, reducedMotion, held], sync)

let dragX: number | null = null
let dragged = false

function onPointerDown(event: PointerEvent) {
  dragX = event.clientX
  dragged = false
}

function onPointerMove(event: PointerEvent) {
  if (dragX === null || !orrery.value)
    return
  const dx = event.clientX - dragX
  if (!dragged && Math.abs(dx) < 4)
    return
  if (!dragged)
    orrery.value.setPointerCapture(event.pointerId)
  dragged = true
  dragX = event.clientX
  // One instrument width of drag turns the inner orbit about once.
  elapsed.value += (dx / orrery.value.clientWidth) * ORBITS[0].period
}

function onPointerUp() {
  dragX = null
}

function place(planet: typeof planets[number]) {
  const orbit = ORBITS[planet.orbit]
  const angle = (planet.phase + elapsed.value / orbit.period) * Math.PI * 2
  const depth = (Math.sin(angle) + 1) / 2
  return {
    x: 50 + Math.cos(angle) * orbit.rx * 100,
    y: CY + Math.sin(angle) * orbit.rx * 100 * FLATTEN,
    depth,
  }
}

const placed = computed(() => planets.map(planet => ({ planet, ...place(planet) })))

/** Reveal the chosen theme as a circle opening from its planet. */
async function choose(planet: typeof planets[number], event: MouseEvent) {
  if (dragged) {
    dragged = false
    return
  }
  const el = section.value
  const start = document.startViewTransition?.bind(document)
  if (!el || !start || reducedMotion.value === 'reduce' || planet.id === selectedId.value) {
    selectedId.value = planet.id
    return
  }
  const box = el.getBoundingClientRect()
  const from = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = from.left + from.width / 2 - box.left
  const y = from.top + from.height / 2 - box.top
  const r = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y))
  wiping.value = true
  const transition = start(async () => {
    selectedId.value = planet.id
    await nextTick()
  })
  try {
    await transition.ready
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 760, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(release-themes)' },
    )
    await transition.finished
  }
  finally {
    wiping.value = false
  }
}
</script>

<template>
  <section ref="section" class="theme-section" :class="{ 'is-wiping': wiping }" :style="skin" aria-labelledby="themes-title">
    <div class="theme-copy">
      <h2 id="themes-title" class="release-heading">
        <span v-for="line in copy.title" :key="line">{{ line }}</span>
      </h2>
      <p class="release-description">
        {{ copy.description }}
      </p>

      <figure class="theme-card" aria-live="polite">
        <img :key="selected.id" :src="selected.image" :alt="selected.info.description" width="1200" height="590" loading="lazy" decoding="async">
        <figcaption>
          <strong>{{ selected.label }}</strong>
          <span>{{ selected.info.description }}</span>
        </figcaption>
      </figure>
      <div class="theme-links">
        <a :href="selected.example" target="_blank" rel="noreferrer">{{ copy.live }}</a>
        <RouterLink v-if="selected.info.docs" :to="selected.info.docs">
          {{ copy.docs }}
        </RouterLink>
        <RouterLink :to="`${prefix}/themes/`">
          {{ copy.more }}
        </RouterLink>
      </div>
    </div>

    <div
      ref="orrery"
      class="orrery"
      role="group"
      :aria-label="copy.orrery"
      @pointerenter="held = true"
      @pointerleave="held = false; onPointerUp()"
      @focusin="held = true"
      @focusout="held = false"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <!-- The instrument: engraved orbits, a degree scale, and the brass arms. -->
      <svg class="orrery-frame" :viewBox="`0 0 100 ${VIEW_H}`" preserveAspectRatio="none" aria-hidden="true">
        <ellipse
          v-for="(orbit, index) in ORBITS"
          :key="index"
          cx="50" :cy="CY" :rx="orbit.rx * 100" :ry="orbit.rx * 100 * FLATTEN"
          class="orbit"
        />
        <line
          v-for="deg in TICKS"
          :key="deg"
          class="tick"
          :class="{ 'is-major': deg % 30 === 0 }"
          :x1="50 + Math.cos(deg / 57.2958) * 49" :y1="CY + Math.sin(deg / 57.2958) * 49 * FLATTEN"
          :x2="50 + Math.cos(deg / 57.2958) * (deg % 30 === 0 ? 51.5 : 50.4)" :y2="CY + Math.sin(deg / 57.2958) * (deg % 30 === 0 ? 51.5 : 50.4) * FLATTEN"
        />
        <g v-for="item in placed" :key="item.planet.id">
          <line class="arm" x1="50" :y1="CY" :x2="item.x" :y2="item.y" :opacity="0.35 + item.depth * 0.5" />
          <circle class="arm-pivot" :cx="item.x" :cy="item.y" r="0.5" />
        </g>
      </svg>

      <span class="orrery-sun">
        <img src="/favicon.svg" alt="" width="40" height="40">
      </span>

      <button
        v-for="item in placed"
        :key="item.planet.id"
        type="button"
        class="planet"
        :class="{ 'is-selected': item.planet.id === selectedId }"
        :style="{
          'left': `${item.x}%`,
          'top': `${(item.y / VIEW_H) * 100}%`,
          'zIndex': item.depth > 0.5 ? 4 : 1,
          '--depth': item.depth,
        }"
        :aria-pressed="item.planet.id === selectedId"
        @click="choose(item.planet, $event)"
      >
        <span class="planet-body">
          <ReleaseV1Planet :kind="item.planet.kind" v-bind="item.planet.skin" />
        </span>
        <span class="planet-name">{{ item.planet.label }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.theme-section {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 56px;
  align-items: center;
  padding-block: 110px;
  padding-inline: max(40px, calc((100% - 1180px) / 2));
  color: var(--skin-ink);
  background: var(--skin-bg);
  font-family: var(--skin-font);
  transition: background-color 600ms, color 600ms;
  view-transition-name: release-themes;
}

/* The view transition does the reveal; let the new state paint at once. */
.theme-section.is-wiping,
.theme-section.is-wiping * {
  transition: none !important;
}

.theme-section .release-heading {
  font-weight: 600;
}

.theme-section .release-description {
  color: color-mix(in srgb, var(--skin-ink) 72%, transparent);
}

.theme-card {
  margin: 32px 0 0;
}

.theme-card img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top;
  border: 1px solid color-mix(in srgb, var(--skin-ink) 16%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--skin-ink) 6%, transparent);
}

.theme-card figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 14px;
  font-size: 15px;
}

.theme-card figcaption span {
  color: color-mix(in srgb, var(--skin-ink) 72%, transparent);
}

.theme-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  margin-top: 18px;
  font-size: 15px;
}

.theme-links a {
  color: var(--skin-accent);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--skin-accent) 40%, transparent);
  text-underline-offset: 5px;
}

.orrery {
  position: relative;
  width: 100%;
  aspect-ratio: 100 / 64;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.orrery:active {
  cursor: grabbing;
}

.orrery-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.orbit,
.tick,
.arm {
  fill: none;
  stroke: var(--skin-ink);
  vector-effect: non-scaling-stroke;
}

.orbit {
  stroke-opacity: 0.22;
}

.tick {
  stroke-opacity: 0.3;
}

.tick.is-major {
  stroke-opacity: 0.6;
}

.arm {
  stroke: var(--skin-accent);
  stroke-width: 1;
}

.arm-pivot {
  fill: var(--skin-accent);
}

.orrery-sun {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  border: 1px solid color-mix(in srgb, var(--skin-ink) 30%, transparent);
  border-radius: 50%;
  background: var(--skin-bg);
  box-shadow: 0 0 0 8px color-mix(in srgb, var(--skin-bg) 70%, transparent);
  translate: -50% -50%;
}

.planet {
  position: absolute;
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  color: inherit;
  background: none;
  font: inherit;

  /* Farther planets sit smaller and fainter, as on a tilted instrument. */
  opacity: calc(0.55 + var(--depth) * 0.45);
  translate: -50% -34px;
  scale: calc(0.72 + var(--depth) * 0.38);
  cursor: pointer;
}

.planet-body {
  width: 68px;
  height: 68px;
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.planet:hover .planet-body,
.planet:focus-visible .planet-body {
  transform: scale(1.12);
}

.planet.is-selected .planet-body {
  transform: scale(1.25);
}

.planet-name {
  font-size: 14px;
  white-space: nowrap;
}

.planet.is-selected .planet-name {
  color: var(--skin-accent);
  font-weight: 600;
}

.theme-section :focus-visible {
  outline: 2px solid var(--skin-accent);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: no-preference) {
  .theme-card img {
    animation: theme-arrive 500ms cubic-bezier(0.22, 1, 0.36, 1);
  }
}

@keyframes theme-arrive {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (width <= 900px) {
  .theme-section {
    grid-template-columns: 1fr;
    gap: 32px;
    padding-block: 56px 72px;
    padding-inline: 24px;
  }

  .orrery {
    grid-row: 1;
  }

  .planet-body {
    width: 52px;
    height: 52px;
  }
}
</style>
