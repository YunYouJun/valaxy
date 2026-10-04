// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { svgToPng } from '../../packages/valaxy/client/utils/svg'

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function mountSvg(markup = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.innerHTML = markup
  document.body.append(svg)
  return svg
}

it('rejects invalid dimensions and unsupported external resources before allocating a canvas', async () => {
  await expect(svgToPng(mountSvg(), { width: 0 })).rejects.toThrow('dimensions')
  await expect(svgToPng(mountSvg('<image href="https://example.com/sky.png" />'))).rejects.toThrow('data URLs')
  await expect(svgToPng(mountSvg('<foreignObject />'))).rejects.toThrow('without HTML')
  const detached = mountSvg()
  detached.remove()
  await expect(svgToPng(detached)).rejects.toThrow('Mount the SVG')
})

it('cleans up the temporary SVG URL when image decoding fails', async () => {
  const revoke = vi.fn()
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:cover'), revokeObjectURL: revoke })
  vi.stubGlobal('Image', class {
    src = ''
    async decode() { throw new Error('decode failed') }
  })
  await expect(svgToPng(mountSvg())).rejects.toThrow('decode failed')
  expect(revoke).toHaveBeenCalledWith('blob:cover')
})
