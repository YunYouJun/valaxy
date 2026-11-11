// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { backToTop, goDown } from '../../packages/valaxy-theme-yun/utils/animation'

const { load, to } = vi.hoisted(() => ({ load: vi.fn(), to: vi.fn() }))
vi.mock('../../packages/valaxy-theme-yun/utils/scroll', () => {
  load()
  return { gsap: { to } }
})

it('loads scrolling code only on a usable action, then reuses it', async () => {
  expect(load).not.toHaveBeenCalled()
  await goDown()
  expect(load).not.toHaveBeenCalled()
  const banner = document.createElement('div')
  banner.id = 'yun-banner'
  Object.defineProperty(banner, 'clientHeight', { value: 600 })
  document.body.append(banner)
  try {
    await goDown()
    expect(load).toHaveBeenCalledTimes(1)
    expect(to).toHaveBeenLastCalledWith(window, expect.objectContaining({ scrollTo: { y: 550 } }))
    await backToTop()
    expect(load).toHaveBeenCalledTimes(1)
    expect(to).toHaveBeenLastCalledWith(window, expect.objectContaining({ scrollTo: { y: 0 } }))
  }
  finally {
    banner.remove()
  }
})
