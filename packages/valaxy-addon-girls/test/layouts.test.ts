import { describe, expect, it } from 'vitest'
import {
  getBubblePoints,
  getGirlKey,
  getOrbitPoint,
} from '../client/layouts'

describe('girls layout helpers', () => {
  it('creates stable keys from external identifiers', () => {
    expect(getGirlKey({ anilist_id: 1111, name: 'C.C.' }, 0)).toBe('1111')
    expect(getGirlKey({ from: 'CODE GEASS', name: 'C.C.' }, 2)).toBe('C.C.-CODE GEASS-2')
  })

  it('packs bubbles deterministically without overlap', () => {
    const points = getBubblePoints(120)
    expect(points).toHaveLength(120)
    expect(getBubblePoints(120)).toBe(points)
    expect(points[0].diameter).toBeGreaterThan(points.at(-1)!.diameter)

    for (let index = 0; index < points.length; index++) {
      const point = points[index]
      expect(Math.hypot(point.x - 50, point.y - 50) + point.diameter / 2).toBeLessThanOrEqual(47.01)

      for (let otherIndex = 0; otherIndex < index; otherIndex++) {
        const other = points[otherIndex]
        const distance = Math.hypot(point.x - other.x, point.y - other.y)
        expect(distance).toBeGreaterThanOrEqual((point.diameter + other.diameter) / 2 - 0.01)
      }
    }
  })

  it('keeps orbit points within the stage', () => {
    const points = Array.from({ length: 24 }, (_, index) => getOrbitPoint(index, 24))
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(4)
      expect(point.x).toBeLessThanOrEqual(96)
      expect(point.y).toBeGreaterThanOrEqual(8)
      expect(point.y).toBeLessThanOrEqual(92)
    }
  })
})
