/**
 * Draws the "postcard from the galaxy of words": a cyanotype card where a
 * visitor's line is charted as a constellation, with a postmark and catalog
 * number derived from the text so the same line always gives the same card.
 */

export interface PostcardCopy {
  title: string
  to: string
  from: string
  office: string
  catalog: string
}

export const POSTCARD_WIDTH = 1500
export const POSTCARD_HEIGHT = 1000

const PLATE = '#0a1a4f'
const CHALK = 'rgb(255 255 255 / 0.82)'
const RULE = 'rgb(255 255 255 / 0.22)'
const VIOLET = '#d7c2ff'
const FONT = '"LXGW WenKai Screen", Literata, serif'
const MONO = '"Maple Mono", ui-monospace, monospace'

function hash(text: string) {
  let h = 2166136261
  for (const ch of text) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Five-digit catalog number, stable for a given line. */
export function catalogNumber(text: string) {
  return String(hash(text) % 100000).padStart(5, '0')
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line)
      line = ''
    }
    line += ch
  }
  if (line)
    lines.push(line)
  return lines
}

export function drawPostcard(canvas: HTMLCanvasElement, text: string, copy: PostcardCopy, date = new Date()) {
  canvas.width = POSTCARD_WIDTH
  canvas.height = POSTCARD_HEIGHT
  const ctx = canvas.getContext('2d')!
  const rand = mulberry32(hash(text))
  const W = POSTCARD_WIDTH
  const H = POSTCARD_HEIGHT
  const split = W * 0.64

  // Ground and sun-print grain.
  ctx.fillStyle = PLATE
  ctx.fillRect(0, 0, W, H)
  const grain = mulberry32(7)
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgb(${grain() < 0.5 ? '18 60 156' : '4 12 40'} / ${0.15 + grain() * 0.25})`
    ctx.fillRect(grain() * W, grain() * H, 1.5, 1.5)
  }

  // Deckle frame and the divider between the picture and the address side.
  ctx.strokeStyle = RULE
  ctx.lineWidth = 2
  ctx.strokeRect(36, 36, W - 72, H - 72)
  ctx.beginPath()
  ctx.moveTo(split, 90)
  ctx.lineTo(split, H - 90)
  ctx.stroke()

  // Graticule behind the constellation.
  const cx = split / 2 + 18
  const cy = H * 0.42
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-0.3)
  ctx.lineWidth = 1.5
  for (const r of [150, 270, 390]) {
    ctx.beginPath()
    ctx.ellipse(0, 0, r, r * 0.52, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()

  // Background field stars.
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgb(255 255 255 / ${0.15 + rand() * 0.45})`
    ctx.beginPath()
    ctx.arc(60 + rand() * (split - 120), 60 + rand() * (H - 120), rand() * 1.8 + 0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // The constellation: one star per character, joined in reading order.
  const glyphs = [...text].filter(ch => ch.trim()).slice(0, 24)
  const points: [number, number][] = []
  let angle = rand() * Math.PI * 2
  let x = cx - 230
  let y = cy + (rand() - 0.5) * 120
  const step = Math.min(110, 520 / Math.max(glyphs.length - 1, 1))
  for (let i = 0; i < glyphs.length; i++) {
    points.push([x, y])
    angle += (rand() - 0.5) * 1.6
    x += Math.max(step * 0.55, Math.cos(angle) * step + step * 0.45)
    y += Math.sin(angle) * step * 0.7
    y = Math.min(H * 0.68, Math.max(120, y))
  }
  // Re-center the figure on the plate.
  const minX = Math.min(...points.map(p => p[0]))
  const maxX = Math.max(...points.map(p => p[0]))
  const shift = cx - (minX + maxX) / 2
  points.forEach(p => (p[0] += shift))

  ctx.strokeStyle = 'rgb(215 194 255 / 0.75)'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 9])
  ctx.beginPath()
  points.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
  ctx.stroke()
  ctx.setLineDash([])

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  points.forEach(([px, py], i) => {
    const bright = i === 0 || i === points.length - 1
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(px, py, bright ? 7 : 4.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgb(255 255 255 / 0.5)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(px, py, bright ? 16 : 11, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = VIOLET
    ctx.font = `30px ${FONT}`
    ctx.fillText(glyphs[i], px + 18, py - 22)
  })

  // The line itself, set like a caption under the figure.
  ctx.fillStyle = '#fff'
  ctx.font = `600 64px ${FONT}`
  ctx.textBaseline = 'alphabetic'
  const lines = wrap(ctx, text, split - 200).slice(0, 3)
  lines.forEach((line, i) => ctx.fillText(line, 96, H - 120 - (lines.length - 1 - i) * 80))

  // Address side.
  const ax = split + 64
  ctx.fillStyle = CHALK
  ctx.font = `italic 34px ${FONT}`
  ctx.fillText(copy.title, ax, 150)
  ctx.font = `30px ${FONT}`
  const rows = [copy.to, `${copy.from} ${date.toLocaleDateString('sv-SE')}`]
  rows.forEach((row, i) => {
    const ry = 520 + i * 110
    ctx.fillStyle = CHALK
    ctx.fillText(row, ax, ry)
    ctx.strokeStyle = RULE
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(ax, ry + 26)
    ctx.lineTo(W - 96, ry + 26)
    ctx.stroke()
  })
  ctx.font = `24px ${MONO}`
  ctx.fillStyle = 'rgb(255 255 255 / 0.6)'
  ctx.fillText(`${copy.catalog} ${catalogNumber(text)}`, ax, H - 110)

  // Postmark: two rings, the office around the rim, the date across the middle.
  const px = W - 230
  const py = 300
  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(-0.18)
  ctx.strokeStyle = VIOLET
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, 112, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, 0, 80, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = VIOLET
  ctx.font = `22px ${FONT}`
  ctx.textAlign = 'center'
  const rim = `VALAXY 1.0 ${copy.office} `
  const chars = [...rim]
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 + (i / chars.length) * Math.PI * 2
    ctx.save()
    ctx.rotate(a + Math.PI / 2)
    ctx.fillText(ch, 0, -90)
    ctx.restore()
  })
  ctx.font = `600 30px ${MONO}`
  ctx.fillText(date.toLocaleDateString('sv-SE').replace(/-/g, '.'), 0, 10)
  ctx.restore()

  // Wavy cancellation lines running off the postmark.
  ctx.strokeStyle = 'rgb(215 194 255 / 0.55)'
  ctx.lineWidth = 2
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    for (let wx = 0; wx <= 260; wx += 4) {
      const wy = py - 45 + i * 30 + Math.sin(wx / 18) * 6
      if (wx)
        ctx.lineTo(px - 400 + wx, wy)
      else
        ctx.moveTo(px - 400 + wx, wy)
    }
    ctx.stroke()
  }
}
