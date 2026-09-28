<script setup lang="ts">
import type { MermaidConfig } from 'mermaid'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { renderDiagram } from './render'

const props = withDefaults(defineProps<{
  source: string
  dark?: boolean
  config?: MermaidConfig
  viewer?: boolean
  appearance?: 'default' | 'soft'
  scale?: number
  locale?: string
}>(), { viewer: true, appearance: 'default' })
// Keep the SSR shell stable until Valaxy restores browser locale/theme state.
const clientReady = ref(false)
const labels = computed(() => clientReady.value && props.locale?.startsWith('zh')
  ? {
      diagram: '图表',
      expand: '放大查看',
      loading: '正在绘制图表…',
      error: '图表暂时无法显示，请检查 Mermaid 语法。',
      details: '查看错误与源码',
      caption: '点击图表放大查看',
      title: '图表预览',
      controls: '图表缩放',
      zoomOut: '缩小图表',
      zoomIn: '放大图表',
      scale: '当前缩放比例',
      original: '原始大小（1）',
      fit: '适应窗口',
      close: '关闭图表预览',
      canvas: '图表画布，可用加减号缩放、方向键平移，0 适应窗口',
      help: '滚轮或双指缩放 · 拖动平移 · 双击适应 · Esc 关闭',
      touchHelp: '双指缩放 · 单指拖动 · 点按工具栏适应窗口',
    }
  : {
      diagram: 'Diagram',
      expand: 'Expand diagram',
      loading: 'Rendering diagram…',
      error: 'Unable to render the diagram. Check the Mermaid syntax.',
      details: 'Show error and source',
      caption: 'Click the diagram to expand',
      title: 'Diagram preview',
      controls: 'Diagram zoom',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in',
      scale: 'Current zoom',
      original: 'Original size (1)',
      fit: 'Fit to window',
      close: 'Close diagram preview',
      canvas: 'Diagram canvas. Plus/minus to zoom, arrows to pan, 0 to fit.',
      help: 'Wheel or pinch to zoom · Drag to pan · Double-click to fit · Esc to close',
      touchHelp: 'Pinch to zoom · Drag to pan · Tap Fit to reset',
    })
// Server rendering cannot read the browser's saved/system color preference.
// Match the light SSR shell first, then apply the client theme after hydration.
const isDark = computed(() => clientReady.value && props.dark)
const uid = `diagram-${useId().replace(/[^\w-]/g, '')}`
const svg = ref('')
const error = ref('')
const loading = ref(true)
const opened = ref(false)
const preview = ref<HTMLElement>()
const svgHost = ref<HTMLElement>()
const dialog = ref<HTMLDialogElement>()
const canvas = ref<HTMLElement>()
const opener = ref<HTMLButtonElement>()
const previewHeight = ref<number>()
const dimensions = ref({ width: 1, height: 1 })
const scale = ref(1)
const x = ref(0)
const y = ref(0)
const dragging = ref(false)
const percentage = computed(() => `${Math.round(scale.value * 100)}%`)
const svgStyle = computed(() => opened.value
  ? {
      width: `${dimensions.value.width}px`,
      height: `${dimensions.value.height}px`,
      transform: `translate(${x.value}px, ${y.value}px) scale(${scale.value})`,
    }
  : props.scale != null ? { '--mermaid-height': `${dimensions.value.height * props.scale}px` } : undefined)

let revision = 0
let mounted = false
let resizeObserver: ResizeObserver | undefined
let bodyOverflow: string | undefined
const pointers = new Map<number, { x: number, y: number }>()

async function render() {
  const current = ++revision
  loading.value = true
  error.value = ''
  try {
    const result = await renderDiagram(`${uid}-${current}`, props.source, !!props.dark, props.config, props.appearance)
    if (!mounted || current !== revision)
      return
    svg.value = result.svg
    await nextTick()
    if (!mounted || current !== revision)
      return
    const host = svgHost.value
    if (!host)
      return
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' })
    root.innerHTML = `<style>
      svg { display: block; width: 100%; height: auto; max-width: 100%; max-height: 560px; margin: auto; }
      :host([data-scale]) svg { height: var(--mermaid-height); width: auto; max-height: none; }
      :host(.diagram-svg-expanded) div { height: 100%; }
      :host(.diagram-svg-expanded) svg { width: 100%; height: 100%; max-width: none; max-height: none; }
      @media print { svg { max-height: none; } }
    </style><div>${result.svg}</div>`
    const element = root.querySelector('svg')
    element?.removeAttribute('style')
    const box = element?.viewBox.baseVal
    if (box?.width && box.height)
      dimensions.value = { width: box.width, height: box.height }
    result.bindFunctions?.(root.querySelector('div')!)
    if (opened.value)
      fit()
  }
  catch (cause) {
    if (!mounted || current !== revision)
      return
    close()
    svg.value = ''
    if (svgHost.value?.shadowRoot)
      svgHost.value.shadowRoot.innerHTML = ''
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
  finally {
    if (mounted && current === revision)
      loading.value = false
  }
}

function fitScale() {
  const bounds = canvas.value
  if (!bounds)
    return 1
  return Math.min((bounds.clientWidth - 48) / dimensions.value.width, (bounds.clientHeight - 48) / dimensions.value.height, 1)
}

function fit() {
  if (!canvas.value)
    return
  scale.value = Math.max(0.01, fitScale())
  x.value = (canvas.value.clientWidth - dimensions.value.width * scale.value) / 2
  y.value = (canvas.value.clientHeight - dimensions.value.height * scale.value) / 2
}

function zoom(value: number, anchorX?: number, anchorY?: number) {
  if (!canvas.value)
    return
  const next = Math.min(4, Math.max(Math.min(0.1, fitScale()), value))
  const px = anchorX ?? canvas.value.clientWidth / 2
  const py = anchorY ?? canvas.value.clientHeight / 2
  const ratio = next / scale.value
  x.value = px - (px - x.value) * ratio
  y.value = py - (py - y.value) * ratio
  scale.value = next
}

async function open() {
  if (!props.viewer || !svg.value || opened.value || !dialog.value)
    return
  previewHeight.value = preview.value?.clientHeight
  bodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  dialog.value.showModal()
  opened.value = true
  await nextTick()
  fit()
  canvas.value?.focus()
}

function restorePage() {
  opened.value = false
  previewHeight.value = undefined
  pointers.clear()
  dragging.value = false
  if (bodyOverflow !== undefined) {
    document.body.style.overflow = bodyOverflow
    bodyOverflow = undefined
  }
}

function close() {
  if (!opened.value)
    return
  dialog.value?.close()
  restorePage()
  opener.value?.focus({ preventScroll: true })
}

function isInteractive(event: Event) {
  return event.composedPath().some(target => target instanceof Element && target.matches('a, .clickable'))
}

function openFromPreview(event: MouseEvent) {
  if (isInteractive(event))
    return
  void open()
}

function wheel(event: WheelEvent) {
  const rect = canvas.value!.getBoundingClientRect()
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1)
  zoom(scale.value * Math.exp(-Math.max(-100, Math.min(100, delta)) * 0.004), event.clientX - rect.left, event.clientY - rect.top)
}

function pointerDown(event: PointerEvent) {
  if (event.button !== 0 || isInteractive(event))
    return
  canvas.value?.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  dragging.value = true
}

function pointerMove(event: PointerEvent) {
  const previous = pointers.get(event.pointerId)
  if (!previous)
    return
  const before = [...pointers.values()]
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  const after = [...pointers.values()]
  if (pointers.size === 2) {
    const distance = (points: typeof before) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
    const oldDistance = distance(before)
    const rect = canvas.value!.getBoundingClientRect()
    if (oldDistance > 0) {
      zoom(scale.value * distance(after) / oldDistance, (before[0].x + before[1].x) / 2 - rect.left, (before[0].y + before[1].y) / 2 - rect.top)
    }
    x.value += (after[0].x + after[1].x - before[0].x - before[1].x) / 2
    y.value += (after[0].y + after[1].y - before[0].y - before[1].y) / 2
  }
  else if (pointers.size === 1) {
    x.value += event.clientX - previous.x
    y.value += event.clientY - previous.y
  }
}

function pointerEnd(event: PointerEvent) {
  pointers.delete(event.pointerId)
  dragging.value = pointers.size > 0
}

function keydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.target !== canvas.value)
    return
  switch (event.key) {
    case '+': case '=': zoom(scale.value * 1.25)
      break
    case '-': zoom(scale.value / 1.25)
      break
    case '0': fit()
      break
    case '1': zoom(1)
      break
    case 'ArrowLeft': x.value += 40
      break
    case 'ArrowRight': x.value -= 40
      break
    case 'ArrowUp': y.value += 40
      break
    case 'ArrowDown': y.value -= 40
      break
    default: return
  }
  event.preventDefault()
}

onMounted(() => {
  mounted = true
  clientReady.value = true
  void render()
  resizeObserver = new ResizeObserver(() => {
    if (opened.value)
      fit()
  })
  if (canvas.value)
    resizeObserver.observe(canvas.value)
})
watch([() => props.source, () => props.dark, () => props.config, () => props.appearance], () => {
  if (mounted)
    void render()
}, { deep: true })
watch(() => props.viewer, (value) => {
  if (!value)
    close()
})
onBeforeUnmount(() => {
  mounted = false
  revision++
  resizeObserver?.disconnect()
  dialog.value?.close()
  restorePage()
})
</script>

<template>
  <figure class="diagram-card" :class="{ 'diagram-dark': isDark, 'diagram-static': !viewer }" :aria-busy="loading">
    <figcaption v-if="viewer" class="diagram-toolbar">
      <span class="diagram-label"><span aria-hidden="true" class="diagram-dot" />{{ labels.diagram }}</span>
      <button ref="opener" type="button" class="diagram-expand" :disabled="!svg || loading" aria-haspopup="dialog" @click="open">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6" /></svg>
        {{ labels.expand }}
      </button>
    </figcaption>
    <div ref="preview" class="diagram-preview" :style="previewHeight ? { height: `${previewHeight}px` } : undefined" @click="openFromPreview">
      <p v-if="loading && !svg" class="diagram-status" role="status">
        {{ labels.loading }}
      </p>
      <div v-if="error" class="diagram-error" role="alert">
        <p>{{ labels.error }}</p>
        <details><summary>{{ labels.details }}</summary><pre>{{ error }}</pre><pre>{{ props.source }}</pre></details>
      </div>
      <!-- Move the actual SVG, not a copy: IDs, markers, links and callbacks stay intact. -->
      <Teleport :to="canvas || 'body'" :disabled="!opened">
        <div ref="svgHost" class="diagram-svg" :class="{ 'diagram-svg-expanded': opened }" :style="svgStyle" :data-scale="!opened && props.scale != null ? '' : undefined" />
      </Teleport>
    </div>
    <div v-if="svg && viewer" class="diagram-caption">
      {{ labels.caption }}
    </div>
    <dialog ref="dialog" class="diagram-dialog" :aria-labelledby="`${uid}-title`" :aria-describedby="`${uid}-help`" @cancel.prevent="close" @close="restorePage" @click.self="close">
      <header class="diagram-viewer-toolbar">
        <span :id="`${uid}-title`" class="diagram-viewer-title">{{ labels.title }}</span>
        <div class="diagram-controls" role="group" :aria-label="labels.controls">
          <button type="button" :aria-label="labels.zoomOut" :title="labels.zoomOut" :disabled="scale <= Math.min(0.1, fitScale())" @click="zoom(scale / 1.25)">
            −
          </button>
          <output class="diagram-scale" :aria-label="labels.scale" aria-live="polite">{{ percentage }}</output>
          <button type="button" :aria-label="labels.zoomIn" :title="labels.zoomIn" :disabled="scale >= 4" @click="zoom(scale * 1.25)">
            +
          </button>
          <span class="diagram-divider" aria-hidden="true" />
          <button type="button" :title="labels.original" @click="zoom(1)">
            100%
          </button>
          <button type="button" class="diagram-fit" :aria-label="labels.fit" :title="labels.fit" @click="fit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /><rect x="7" y="7" width="10" height="10" rx="1" /></svg>
            <span class="diagram-fit-label">{{ labels.fit }}</span>
          </button>
        </div>
        <button type="button" class="diagram-close" :aria-label="labels.close" :title="labels.close" @click="close">
          ×
        </button>
      </header>
      <div ref="canvas" class="diagram-canvas" :class="{ 'is-dragging': dragging }" tabindex="0" role="region" :aria-label="labels.canvas" @wheel.prevent="wheel" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd" @lostpointercapture="pointerEnd" @keydown="keydown" @dblclick="fit" />
      <footer :id="`${uid}-help`" class="diagram-viewer-help">
        <span class="diagram-help-desktop">{{ labels.help }}</span>
        <span class="diagram-help-touch">{{ labels.touchHelp }}</span>
      </footer>
    </dialog>
  </figure>
</template>

<style scoped>
.diagram-card {
  /* Host tokens stay inherited; only the addon owns these aliases/fallbacks. */
  --diagram-fallback-bg: #fff;
  --diagram-fallback-panel: #f9f9f9;
  --diagram-fallback-text: #3c3c43;
  --diagram-fallback-muted: #606068;
  --diagram-fallback-accent: #3451b2;
  --diagram-fallback-border: #e2e2e3;
  --diagram-bg: var(--va-mermaid-bg, var(--va-c-bg, var(--diagram-fallback-bg)));
  --diagram-panel: var(--va-mermaid-panel, var(--va-c-bg-soft, var(--diagram-fallback-panel)));
  --diagram-text: var(--va-mermaid-text, var(--pr-c-text-1, var(--va-c-text-1, var(--diagram-fallback-text))));
  --diagram-muted: var(--va-mermaid-muted, var(--pr-c-text-2, var(--va-c-text-2, var(--diagram-fallback-muted))));
  --diagram-accent: var(--va-mermaid-accent, var(--yun-focus-color, var(--va-c-brand-1, var(--diagram-fallback-accent))));
  --diagram-border: var(--va-mermaid-border, var(--va-c-divider, var(--diagram-fallback-border)));
  --diagram-grid: var(--va-mermaid-grid, var(--yun-grid-color, var(--diagram-border)));
  --diagram-radius: var(--va-mermaid-radius, var(--va-card-border-radius, 8px));
  --diagram-button-radius: var(--va-mermaid-button-radius, 6px);

  box-sizing: border-box;
  min-width: 0;
  margin: 28px 0;
  overflow: hidden;
  border: 1px solid var(--diagram-border);
  border-radius: var(--diagram-radius);
  background: var(--diagram-bg);
  color: var(--diagram-text);
  font-family: var(--va-font-sans, inherit);
  line-height: 1.5;
  text-align: start;
  color-scheme: light;
}

.diagram-card.diagram-dark {
  --diagram-fallback-bg: #1a1a1d;
  --diagram-fallback-panel: #202127;
  --diagram-fallback-text: #dfdfe3;
  --diagram-fallback-muted: #a4a4ad;
  --diagram-fallback-accent: #a8b1ff;
  --diagram-fallback-border: #2e2e32;

  color-scheme: dark;
}

.diagram-card.diagram-theme-yun {
  --diagram-bg: var(--va-mermaid-bg, var(--va-c-bg-light, var(--diagram-fallback-bg)));
  --diagram-button-radius: var(--va-mermaid-button-radius, 999px);
}

.diagram-toolbar,
.diagram-viewer-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--diagram-border);
  background: var(--diagram-panel);
}

.diagram-toolbar {
  justify-content: space-between;
}

.diagram-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--diagram-muted);
  font-size: 12px;
  font-weight: 500;
}

.diagram-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--diagram-accent);
}

.diagram-card button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  min-width: 36px;
  min-height: 36px;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: var(--diagram-button-radius);
  background: transparent;
  color: var(--diagram-text);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.25;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
}

.diagram-card .diagram-expand {
  color: var(--diagram-accent);
  background: color-mix(in srgb, var(--diagram-accent) 8%, transparent);
}

@media (hover: hover) {
  .diagram-card button:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--diagram-accent) 25%, transparent);
    background: color-mix(in srgb, var(--diagram-accent) 12%, transparent);
    color: var(--diagram-accent);
  }
}

.diagram-card button:active:not(:disabled) {
  background: color-mix(in srgb, var(--diagram-accent) 18%, transparent);
}

.diagram-card button:disabled {
  opacity: 0.4;
  cursor: default;
}

.diagram-card button:focus-visible,
.diagram-canvas:focus-visible {
  outline: 2px solid var(--diagram-accent);
  outline-offset: -3px;
}

.diagram-preview {
  box-sizing: border-box;
  padding: 24px 16px 12px;
  cursor: zoom-in;
}

.diagram-static .diagram-preview {
  cursor: default;
}

.diagram-caption {
  padding: 4px 12px 14px;
  color: var(--diagram-muted);
  font-size: 12px;
  line-height: 24px;
  text-align: center;
}

.diagram-status,
.diagram-error {
  padding: 16px;
  font-size: 14px;
  cursor: auto;
}

.diagram-error pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.diagram-dialog {
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  width: calc(100vw - 48px);
  height: calc(100vh - 48px);
  height: calc(100dvh - 48px);
  max-width: none;
  max-height: none;
  margin: auto;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--diagram-border);
  border-radius: var(--diagram-radius);
  background: var(--diagram-bg);
  color: var(--diagram-text);
  font: inherit;
  box-shadow: 0 24px 80px rgb(0 0 0 / 0.24);
  overscroll-behavior: contain;
}

.diagram-dialog[open] {
  display: flex;
  flex-direction: column;
}

.diagram-dialog::backdrop {
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
}

.diagram-viewer-toolbar {
  flex-shrink: 0;
}

.diagram-viewer-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.diagram-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-inline-start: auto;
}

.diagram-scale {
  min-width: 42px;
  color: var(--diagram-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.diagram-divider {
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: var(--diagram-border);
}

.diagram-card .diagram-close {
  width: 36px;
  padding: 0;
  font-size: 26px;
  font-weight: 400;
}

.diagram-canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background-image: radial-gradient(var(--diagram-grid) 1px, transparent 1px);
  background-size: 20px 20px;
  cursor: grab;
  touch-action: none;
  overscroll-behavior: contain;
}

.diagram-canvas.is-dragging {
  cursor: grabbing;
  user-select: none;
}

.diagram-svg-expanded {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}

.diagram-viewer-help {
  flex-shrink: 0;
  padding: 10px 16px;
  border-top: 1px solid var(--diagram-border);
  color: var(--diagram-muted);
  font-size: 12px;
  text-align: center;
}

.diagram-help-touch {
  display: none;
}

@media (pointer: coarse), (width <= 640px) {
  .diagram-card button {
    min-height: 44px;
    min-width: 44px;
  }

  .diagram-help-desktop {
    display: none;
  }

  .diagram-help-touch {
    display: inline;
  }
}

@media (width <= 640px), (height <= 500px) {
  .diagram-dialog {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    border: 0;
    border-radius: 0;
    padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
  }

  .diagram-viewer-toolbar {
    padding-top: max(8px, env(safe-area-inset-top));
  }

  .diagram-viewer-help {
    padding-bottom: max(10px, env(safe-area-inset-bottom));
    font-size: 11px;
  }
}

@media (width <= 640px) {
  .diagram-toolbar {
    gap: 8px;
    padding: 8px;
  }

  .diagram-preview {
    padding: 16px 8px 8px;
  }

  .diagram-viewer-toolbar {
    flex-wrap: wrap;
    gap: 4px;
    padding-inline: 8px;
  }

  .diagram-viewer-title {
    flex: 1;
  }

  .diagram-controls {
    order: 3;
    width: 100%;
    margin: 0;
  }
}

@media (width <= 400px) {
  .diagram-fit-label {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .diagram-card button {
    transition: none;
  }
}

@media print {
  .diagram-toolbar,
  .diagram-caption,
  .diagram-dialog {
    display: none;
  }

  .diagram-card {
    border: 0;
  }
}
</style>
