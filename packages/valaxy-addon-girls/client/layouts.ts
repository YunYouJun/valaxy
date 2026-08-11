import type { GirlEntry, GirlsLayout } from '../types'

export const GIRLS_LAYOUTS = ['grid', 'bubbles', 'orbit'] as const satisfies readonly GirlsLayout[]

export interface GirlsLayoutPoint {
  delay: number
  scale: number
  x: number
  y: number
}

export interface GirlsBubblePoint {
  delay: number
  diameter: number
  x: number
  y: number
}

interface RawBubblePoint {
  radius: number
  x: number
  y: number
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const BUBBLE_GAP = 0.28
const BUBBLE_CELL_SIZE = 12
const BUBBLE_PACKING_DENSITY = 0.65
const BUBBLE_RADIAL_STEP = 0.18
const bubbleLayoutCache = new Map<number, readonly GirlsBubblePoint[]>()

interface BubbleSpatialIndex {
  cells: Map<string, RawBubblePoint[]>
  maxRadius: number
}

export function getGirlKey(girl: GirlEntry, index: number) {
  const externalId = girl.anilist_id || girl.douban_id
  return String(girl.url || externalId || `${girl.name}-${girl.from || 'unknown'}-${index}`)
}

export function getBubblePoints(total: number): readonly GirlsBubblePoint[] {
  const safeTotal = Math.max(0, Math.floor(total))
  if (!safeTotal)
    return []

  const cached = bubbleLayoutCache.get(safeTotal)
  if (cached)
    return cached

  const packed: RawBubblePoint[] = []
  let occupiedArea = 0
  const spatialIndex: BubbleSpatialIndex = {
    cells: new Map(),
    maxRadius: getBubbleRadius(0, safeTotal),
  }

  for (let index = 0; index < safeTotal; index++) {
    const radius = getBubbleRadius(index, safeTotal)
    occupiedArea += radius ** 2
    const point = index === 0
      ? { radius, x: 0, y: 0 }
      : findBubblePosition(spatialIndex, radius, index, occupiedArea)

    packed.push(point)
    addBubbleToSpatialIndex(spatialIndex, point)
  }

  const normalized = normalizeBubblePoints(packed)
  bubbleLayoutCache.set(safeTotal, normalized)
  return normalized
}

export function getOrbitPoint(index: number, total: number): GirlsLayoutPoint {
  const visibleTotal = Math.max(1, Math.min(total, 24))
  const ringCount = visibleTotal <= 7 ? 2 : 3
  const ring = index % ringCount
  const itemOnRing = Math.floor(index / ringCount)
  const ringTotal = Math.max(1, Math.ceil((visibleTotal - ring) / ringCount))
  const angle = (itemOnRing / ringTotal) * Math.PI * 2 - Math.PI / 2 + ring * 0.56
  const radiusX = [27, 38, 46][ring]
  const radiusY = [25, 34, 42][ring]

  return {
    delay: index * -0.17,
    scale: 1 - ring * 0.08,
    x: roundPercentage(50 + Math.cos(angle) * radiusX),
    y: roundPercentage(50 + Math.sin(angle) * radiusY),
  }
}

function findBubblePosition(
  spatialIndex: BubbleSpatialIndex,
  radius: number,
  index: number,
  occupiedArea: number,
): RawBubblePoint {
  const angle = index * GOLDEN_ANGLE
  const initialDistance = Math.max(
    radius + BUBBLE_GAP,
    Math.sqrt(occupiedArea / BUBBLE_PACKING_DENSITY) - radius,
  )

  for (let step = 0; step < 10000; step++) {
    const distance = initialDistance + step * BUBBLE_RADIAL_STEP
    const candidate = {
      radius,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    }
    if (!hasBubbleCollision(spatialIndex, candidate))
      return candidate
  }

  return { radius, x: index * (radius * 2 + BUBBLE_GAP), y: 0 }
}

function addBubbleToSpatialIndex(spatialIndex: BubbleSpatialIndex, point: RawBubblePoint) {
  const cellX = Math.floor(point.x / BUBBLE_CELL_SIZE)
  const cellY = Math.floor(point.y / BUBBLE_CELL_SIZE)
  const key = `${cellX}:${cellY}`
  const points = spatialIndex.cells.get(key)

  if (points)
    points.push(point)
  else
    spatialIndex.cells.set(key, [point])
}

function hasBubbleCollision(spatialIndex: BubbleSpatialIndex, candidate: RawBubblePoint) {
  const cellX = Math.floor(candidate.x / BUBBLE_CELL_SIZE)
  const cellY = Math.floor(candidate.y / BUBBLE_CELL_SIZE)
  const cellRange = Math.ceil(
    (candidate.radius + spatialIndex.maxRadius + BUBBLE_GAP) / BUBBLE_CELL_SIZE,
  )

  for (let x = cellX - cellRange; x <= cellX + cellRange; x++) {
    for (let y = cellY - cellRange; y <= cellY + cellRange; y++) {
      const points = spatialIndex.cells.get(`${x}:${y}`)
      if (points?.some(point => (
        Math.hypot(candidate.x - point.x, candidate.y - point.y)
        < candidate.radius + point.radius + BUBBLE_GAP
      ))) {
        return true
      }
    }
  }

  return false
}

function getBubbleRadius(index: number, total: number) {
  if (index === 0)
    return 10.5
  if (index === 1)
    return 8.4
  if (index === 2)
    return 7.4

  const progress = (index - 2) / Math.max(1, total - 3)
  return 6.6 - Math.sqrt(progress) * 2.7
}

function normalizeBubblePoints(points: readonly RawBubblePoint[]): readonly GirlsBubblePoint[] {
  const minX = Math.min(...points.map(point => point.x - point.radius))
  const maxX = Math.max(...points.map(point => point.x + point.radius))
  const minY = Math.min(...points.map(point => point.y - point.radius))
  const maxY = Math.max(...points.map(point => point.y + point.radius))
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const extent = Math.max(...points.map(point => (
    Math.hypot(point.x - centerX, point.y - centerY) + point.radius
  )))
  const targetExtent = points.length === 1 ? 16 : points.length <= 4 ? 32 : points.length <= 8 ? 40 : 47
  const scale = targetExtent / Math.max(1, extent)

  return points.map((point, index) => ({
    delay: Math.min(index, 18) * 24,
    diameter: roundPercentage(point.radius * scale * 2),
    x: roundPercentage(50 + (point.x - centerX) * scale),
    y: roundPercentage(50 + (point.y - centerY) * scale),
  }))
}

function roundPercentage(value: number) {
  return Number(value.toFixed(3))
}
