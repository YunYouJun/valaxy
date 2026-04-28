import { describe, expect, it } from 'vitest'
import { computeZoomRectStyle } from '../../packages/valaxy/client/composables/features/medium-zoom'

describe('computeZoomRectStyle', () => {
  it('freezes the opened image at the same viewport rect', () => {
    const result = computeZoomRectStyle(
      { left: 120, top: 80, width: 1000, height: 600 },
      { left: 20, top: 30 },
    )

    expect(result).toEqual({
      transform: 'translate3d(100px, 50px, 0)',
      width: '1000px',
      height: '600px',
    })
  })

  it('accounts for document scroll when converting viewport rect to layout offset', () => {
    const result = computeZoomRectStyle(
      { left: 120, top: 80, width: 1000, height: 600 },
      { left: 20, top: 330 },
      { x: 10, y: 300 },
    )

    expect(result).toEqual({
      transform: 'translate3d(110px, 50px, 0)',
      width: '1000px',
      height: '600px',
    })
  })

  it('preserves visual center position for #692', () => {
    const visualRect = { left: 160, top: 90, width: 800, height: 480 }
    const result = computeZoomRectStyle(visualRect, { left: 40, top: 30 })
    const match = result.transform.match(/translate3d\(([^,]+),\s*([^,]+)/)!
    const tx = Number.parseFloat(match[1])
    const ty = Number.parseFloat(match[2])

    expect(tx + 40 + visualRect.width / 2).toBe(visualRect.left + visualRect.width / 2)
    expect(ty + 30 + visualRect.height / 2).toBe(visualRect.top + visualRect.height / 2)
  })
})
