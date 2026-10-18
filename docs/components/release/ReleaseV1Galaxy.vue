<script setup lang="ts">
import { useDocumentVisibility, useElementVisibility, usePreferredReducedMotion } from '@vueuse/core'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

const props = defineProps<{
  /** Lines typed at the galaxy's center during the intro, then pulled into orbit. */
  seed: string[]
  /** Characters the galaxy itself is made of. */
  pool: string
  /** Elements laid over the plate (caption, form); stars behind them dim. */
  quiet?: (HTMLElement | null | undefined)[]
}>()

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')
const visible = useElementVisibility(canvasRef)
const documentVisibility = useDocumentVisibility()
const reducedMotion = usePreferredReducedMotion()

const FONT = '"LXGW WenKai Screen", "Maple Mono", "Literata", serif'
const MONO = '"Maple Mono", ui-monospace, monospace'
const TAU = Math.PI * 2
const ARMS = 3
const TILT = -0.32
const FLATTEN = 0.52
const MAX_VISITOR_GLYPHS = 320
const DUST = '··..*+'

/** Timeline of the one orchestrated moment, in seconds. */
const TYPE_STEP = 0.014
const HOLD = 0.35
const TRAVEL = 1.7
const LEAVE_STEP = 0.006

interface Star {
  ch: string
  /** Orbit radius in galaxy units (0 center, 1 rim). */
  r: number
  /** Orbit angle at t = 0. */
  a0: number
  /** Angular speed, rad/s. Inner orbits turn faster. */
  w: number
  size: number
  alpha: number
  color: string
  /** Seed and visitor glyphs fly in from a screen point. */
  fromX?: number
  fromY?: number
  /** Time the glyph appears and the time it starts travelling. */
  showAt: number
  leaveAt: number
  travel: number
  mono?: boolean
  /** Written by the visitor: never knocked out, so it can be followed home. */
  visitor?: boolean
}

let ctx: CanvasRenderingContext2D | null = null
let plate: HTMLCanvasElement | null = null
let stars: Star[] = []
let visitors: Star[] = []
let width = 0
let height = 0
let dpr = 1
let cx = 0
let cy = 0
let radius = 0
let start = 0
let frame = 0
const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 }
let observer: ResizeObserver | null = null
let host: HTMLElement | null = null
/** Caption and form boxes in canvas space, padded so stars fade before the text. */
let quietRects: { l: number, t: number, r: number, b: number }[] = []

// Deterministic randomness keeps the layout stable between resizes and replays.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rand: () => number) {
  return Math.sqrt(-2 * Math.log(rand() || 1e-6)) * Math.cos(TAU * rand())
}

function angularSpeed(r: number) {
  return 0.05 / (0.18 + r)
}

function now() {
  return (performance.now() - start) / 1000
}

function orbitPoint(star: Star, t: number) {
  const angle = star.a0 + (reducedMotion.value === 'reduce' ? 0 : star.w * t)
  const x = Math.cos(angle) * star.r
  const y = Math.sin(angle) * star.r * FLATTEN
  return {
    x: cx + radius * (x * Math.cos(TILT) - y * Math.sin(TILT)),
    y: cy + radius * (x * Math.sin(TILT) + y * Math.cos(TILT)),
  }
}

function buildGalaxy() {
  const rand = mulberry32(1)
  const count = Math.round(Math.min(1300, Math.max(480, (width * height) / 1100)))
  const chars = [...props.pool]
  const scale = Math.min(1, Math.max(0.7, width / 1440))
  const list: Star[] = []

  for (let i = 0; i < count; i++) {
    const inBulge = rand() < 0.24
    const r = inBulge ? Math.abs(gauss(rand)) * 0.1 : 0.08 + 0.92 * rand() ** 1.25
    const arm = i % ARMS
    const a0 = inBulge
      ? rand() * TAU
      : arm * (TAU / ARMS) + r * 2.6 + gauss(rand) * 0.26 * (1 - r * 0.35)
    const bright = !inBulge && r > 0.3 && rand() < 0.07
    list.push({
      // The core is fine star dust that reads as glow; the arms are made of words.
      ch: inBulge ? DUST[Math.floor(rand() * DUST.length)] : chars[Math.floor(rand() * chars.length)],
      r,
      a0,
      w: angularSpeed(r),
      size: Math.round((inBulge ? 6 + rand() * 6 : bright ? 17 + rand() * 9 : 8 + rand() * 6) * scale),
      alpha: (inBulge ? 0.55 + rand() * 0.45 : bright ? 0.85 : 0.26 + rand() * 0.46) * (1 - r * 0.35),
      color: rand() < 0.2 ? '159 211 255' : '255 255 255',
      // The disc lights up from the core outwards once the seed text has unwound.
      showAt: seedDuration() * 0.55 + r * 1.1 + rand() * 0.4,
      leaveAt: 0,
      travel: 0,
    })
  }

  // The seed text: typed as a block over the core, then each glyph joins an arm.
  const size = Math.round(15 * scale)
  const lineHeight = Math.round(22 * scale)
  // Full-width CJK glyphs take a whole em, Latin and Markdown about 0.6 em in Maple Mono.
  const advance = (ch: string) => (/[\u2E80-\u9FFF\uFF00-\uFFEF]/.test(ch) ? size : size * 0.6)
  const lineWidth = (line: string) => [...line].reduce((sum, ch) => sum + advance(ch), 0)
  const blockHeight = props.seed.length * lineHeight
  const blockWidth = Math.max(...props.seed.map(lineWidth))
  let index = 0
  props.seed.forEach((line, row) => {
    let pen = 0
    ;[...line].forEach((ch) => {
      const x = pen + advance(ch) / 2
      pen += advance(ch)
      if (ch === ' ')
        return
      const r = 0.12 + rand() * 0.8
      list.push({
        ch,
        r,
        a0: (index % ARMS) * (TAU / ARMS) + r * 2.6 + gauss(rand) * 0.2,
        w: angularSpeed(r),
        size,
        alpha: 0.95,
        color: '255 255 255',
        mono: true,
        fromX: cx - blockWidth / 2 + x,
        fromY: cy - blockHeight / 2 + row * lineHeight,
        showAt: 0.3 + index * TYPE_STEP,
        leaveAt: 0.3 + seedChars() * TYPE_STEP + HOLD + index * LEAVE_STEP,
        travel: TRAVEL,
      })
      index++
    })
  })

  // Sorting by font lets the draw loop switch `ctx.font` only a few dozen times.
  stars = list.sort((a, b) => a.size - b.size)
}

function seedChars() {
  return props.seed.join('').replace(/ /g, '').length
}

function seedDuration() {
  return 0.3 + seedChars() * (TYPE_STEP + LEAVE_STEP) + HOLD + TRAVEL
}

/** Static layer: cyanotype ground, paper grain and the chart's graticule. */
function paintPlate() {
  plate = document.createElement('canvas')
  plate.width = width * dpr
  plate.height = height * dpr
  const p = plate.getContext('2d')!
  p.scale(dpr, dpr)
  p.fillStyle = '#0a1a4f'
  p.fillRect(0, 0, width, height)

  // Uneven exposure and grain, as on a sun-printed sheet.
  const rand = mulberry32(7)
  for (let i = 0; i < (width * height) / 180; i++) {
    p.fillStyle = `rgb(${rand() < 0.5 ? '18 60 156' : '4 12 40'} / ${0.12 + rand() * 0.22})`
    p.fillRect(rand() * width, rand() * height, 1 + rand() * 1.5, 1 + rand() * 1.5)
  }

  p.save()
  p.translate(cx, cy)
  p.rotate(TILT)
  p.strokeStyle = 'rgb(255 255 255 / 0.09)'
  p.lineWidth = 1
  for (const ring of [0.34, 0.67, 1, 1.18]) {
    p.beginPath()
    p.ellipse(0, 0, radius * ring, radius * ring * FLATTEN, 0, 0, TAU)
    p.stroke()
  }
  // Degree ticks on the outer ring, labelled every 30°.
  p.fillStyle = 'rgb(255 255 255 / 0.32)'
  p.font = `10px ${MONO}`
  p.textAlign = 'center'
  p.textBaseline = 'middle'
  for (let deg = 0; deg < 360; deg += 10) {
    const a = (deg / 180) * Math.PI
    const outer = radius * 1.18
    const x = Math.cos(a) * outer
    const y = Math.sin(a) * outer * FLATTEN
    const len = deg % 30 === 0 ? 8 : 4
    p.beginPath()
    p.moveTo(x, y)
    p.lineTo(x * (1 + len / outer), y * (1 + len / outer))
    p.stroke()
    if (deg % 30 === 0)
      p.fillText(`${deg}°`, x * (1 + 22 / outer), y * (1 + 22 / outer))
  }
  p.restore()
}

/** The V constellation over the core: five catalogued stars, joined once the intro settles. */
function drawConstellation(t: number) {
  if (!ctx)
    return
  const appear = seedDuration() + 0.2
  const progress = reducedMotion.value === 'reduce' ? 1 : Math.min(1, Math.max(0, (t - appear) / 1.2))
  if (progress <= 0)
    return
  const s = radius * 0.62
  const points = [[-0.62, -0.82], [-0.3, -0.16], [0, 0.42], [0.3, -0.16], [0.62, -0.82]].map(([x, y]) => [cx + x * s, cy + y * s])
  ctx.save()
  ctx.strokeStyle = 'rgb(215 194 255 / 0.8)'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 5])
  ctx.beginPath()
  const segments = points.length - 1
  const drawn = progress * segments
  for (let i = 0; i < segments && i < drawn; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const f = Math.min(1, drawn - i)
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f)
  }
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = 'rgb(255 255 255 / 0.9)'
  points.forEach(([x, y], i) => {
    if (i > drawn)
      return
    ctx!.beginPath()
    ctx!.arc(x, y, i === 2 ? 3.5 : 2.5, 0, TAU)
    ctx!.fill()
    ctx!.beginPath()
    ctx!.arc(x, y, 7, 0, TAU)
    ctx!.stroke()
  })
  ctx.restore()
}

function ease(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

function drawStar(star: Star, t: number) {
  if (!ctx || t < star.showAt)
    return
  let { x, y } = orbitPoint(star, t)
  let alpha = star.alpha

  if (star.fromX !== undefined && star.fromY !== undefined) {
    const k = star.travel ? Math.min(1, Math.max(0, (t - star.leaveAt) / star.travel)) : 1
    if (k < 1) {
      const e = ease(k)
      // Bow the path so glyphs sweep into their arm instead of sliding in a line.
      const mx = (star.fromX + x) / 2 + (cy - star.fromY) * 0.35
      const my = (star.fromY + y) / 2 + (star.fromX - cx) * 0.35
      x = (1 - e) ** 2 * star.fromX + 2 * (1 - e) * e * mx + e * e * x
      y = (1 - e) ** 2 * star.fromY + 2 * (1 - e) * e * my + e * e * y
    }
  }
  else {
    alpha *= Math.min(1, (t - star.showAt) / 1.2)
  }

  // Gravitational lens: glyphs near the pointer are pushed aside and brighten.
  const dx = x - pointer.x
  const dy = y - pointer.y
  const d2 = dx * dx + dy * dy
  if (d2 < 140 * 140) {
    const d = Math.sqrt(d2) || 1
    const f = (1 - d / 140) ** 2
    x += (dx / d) * f * 28
    y += (dy / d) * f * 28
    alpha = Math.min(1, alpha + f * 0.6)
  }

  // Like labels on a star chart, the caption and form knock the stars out behind them.
  for (const q of star.visitor ? [] : quietRects) {
    if (x > q.l && x < q.r && y > q.t && y < q.b) {
      alpha *= 0.14
      break
    }
  }

  ctx.fillStyle = `rgb(${star.color} / ${alpha})`
  ctx.fillText(star.ch, x, y)
}

function render() {
  if (!ctx || !plate)
    return
  // Reduced motion renders the finished composition, standing still.
  const t = reducedMotion.value === 'reduce' ? 1e6 : now()
  pointer.x += (pointer.tx - pointer.x) * 0.12
  pointer.y += (pointer.ty - pointer.y) * 0.12

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.drawImage(plate, 0, 0)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let font = ''
  for (const star of stars) {
    const next = `${star.size}px ${star.mono ? MONO : FONT}`
    if (next !== font) {
      ctx.font = next
      font = next
    }
    drawStar(star, t)
  }
  for (const star of visitors) {
    ctx.font = `${star.size}px ${FONT}`
    drawStar(star, t)
  }
  drawConstellation(t)
}

function loop() {
  render()
  frame = requestAnimationFrame(loop)
}

function playing() {
  return visible.value && documentVisibility.value === 'visible' && reducedMotion.value !== 'reduce'
}

function syncLoop() {
  cancelAnimationFrame(frame)
  if (playing())
    frame = requestAnimationFrame(loop)
  else
    render()
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas)
    return
  const rect = canvas.getBoundingClientRect()
  width = rect.width
  height = rect.height
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = width * dpr
  canvas.height = height * dpr
  const narrow = width < 768
  cx = width * (narrow ? 0.5 : 0.62)
  cy = height * (narrow ? 0.3 : 0.42)
  radius = Math.min(width * (narrow ? 0.46 : 0.33), height * (narrow ? 0.4 : 0.6))
  quietRects = (props.quiet ?? []).filter(Boolean).map((el) => {
    const box = el!.getBoundingClientRect()
    return { l: box.left - rect.left - 24, t: box.top - rect.top - 24, r: box.right - rect.left + 24, b: box.bottom - rect.top + 24 }
  })
  buildGalaxy()
  paintPlate()
  syncLoop()
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !canvasRef.value)
    return
  const rect = canvasRef.value.getBoundingClientRect()
  pointer.tx = event.clientX - rect.left
  pointer.ty = event.clientY - rect.top
}

function onPointerLeave() {
  pointer.tx = -9999
  pointer.ty = -9999
}

/** Send a visitor's words into the galaxy from a point on screen (client coordinates). */
function add(text: string, origin: { x: number, y: number }) {
  const canvas = canvasRef.value
  if (!canvas)
    return 0
  const rect = canvas.getBoundingClientRect()
  const t = now()
  const rand = Math.random
  const glyphs = [...text].filter(ch => ch.trim())
  glyphs.forEach((ch, i) => {
    const r = 0.22 + rand() * 0.7
    visitors.push({
      ch,
      r,
      a0: Math.floor(rand() * ARMS) * (TAU / ARMS) + r * 2.6 + gauss(rand) * 0.2 - angularSpeed(r) * t,
      w: angularSpeed(r),
      size: 20 + Math.round(rand() * 6),
      alpha: 1,
      color: '215 194 255',
      visitor: true,
      fromX: origin.x - rect.left + (i - glyphs.length / 2) * 14,
      fromY: origin.y - rect.top,
      showAt: t,
      leaveAt: t + i * 0.05,
      travel: reducedMotion.value === 'reduce' ? 0 : 1.4,
    })
  })
  if (visitors.length > MAX_VISITOR_GLYPHS)
    visitors = visitors.slice(-MAX_VISITOR_GLYPHS)
  if (!playing())
    render()
  return glyphs.length
}

function replay() {
  start = performance.now()
  visitors = []
  syncLoop()
}

defineExpose({ add, replay })

onMounted(async () => {
  ctx = canvasRef.value!.getContext('2d')
  start = performance.now()
  // Lay the glyphs out with the real faces; fall back after a short wait.
  await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))])
  // The page may have moved on while the fonts were loading.
  if (!canvasRef.value)
    return
  start = performance.now()
  observer = new ResizeObserver(resize)
  observer.observe(canvasRef.value!)
  // The caption and form sit above the canvas, so listen on the whole hero.
  host = canvasRef.value!.parentElement
  host?.addEventListener('pointermove', onPointerMove)
  host?.addEventListener('pointerleave', onPointerLeave)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  host?.removeEventListener('pointermove', onPointerMove)
  host?.removeEventListener('pointerleave', onPointerLeave)
})

watch([visible, documentVisibility, reducedMotion], syncLoop)
</script>

<template>
  <canvas
    ref="canvas"
    class="glyph-galaxy"
    aria-hidden="true"
  />
</template>

<style scoped>
.glyph-galaxy {
  display: block;
  width: 100%;
  height: 100%;
  background: #0a1a4f;
}
</style>
