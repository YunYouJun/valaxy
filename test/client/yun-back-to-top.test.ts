// @vitest-environment jsdom
import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, createApp, createSSRApp, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import YunBackToTop from '../../packages/valaxy-theme-yun/components/YunBackToTop.vue'

const mocks = vi.hoisted(() => ({
  useBackToTop: vi.fn(),
  useWindowScrollY: vi.fn(),
  backToTop: vi.fn(),
}))

vi.mock('valaxy', () => ({
  useBackToTop: mocks.useBackToTop,
  useWindowScrollY: mocks.useWindowScrollY,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('../../packages/valaxy-theme-yun/utils/animation', () => ({
  backToTop: mocks.backToTop,
}))

describe('valaxy-theme-yun YunBackToTop', () => {
  let scrollY = ref(0)
  let percentage = ref(0)
  let mountedApp: App | null = null
  let container: HTMLDivElement | null = null

  function mountComponent() {
    container = document.createElement('div')
    document.body.append(container)
    mountedApp = createApp(YunBackToTop)
    mountedApp.mount(container)
    const button = container.querySelector('button.back-to-top')
    if (!(button instanceof HTMLButtonElement))
      throw new Error('Expected .back-to-top button to mount')
    return button
  }

  beforeEach(() => {
    scrollY = ref(0)
    percentage = ref(0)
    mocks.useWindowScrollY.mockImplementation(() => scrollY)
    mocks.useBackToTop.mockImplementation((options?: { offset?: number }) => {
      const offset = options?.offset ?? 100
      return {
        show: computed(() => scrollY.value > offset),
        percentage,
      }
    })
  })

  afterEach(() => {
    mountedApp?.unmount()
    mountedApp = null
    container?.remove()
    container = null
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('omits inline progress style during SSR', async () => {
    vi.stubGlobal('window', undefined)
    const html = await renderToString(createSSRApp(YunBackToTop))
    expect(html).not.toContain('--yun-back-top-progress')
    expect(html.match(/\bstyle="([^"]*)"/)?.[1] ?? '').toBe('')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('tabindex="-1"')
  })

  it('skips useBackToTop and inline progress when CSS animation-timeline scroll(root) is supported', async () => {
    const supports = vi.fn((property: string, value?: string) =>
      property === 'animation-timeline' && value === 'scroll(root)',
    )
    vi.stubGlobal('CSS', { supports })

    const button = mountComponent()

    expect(supports).toHaveBeenCalledWith('animation-timeline', 'scroll(root)')
    expect(mocks.useBackToTop).not.toHaveBeenCalled()
    expect(mocks.useWindowScrollY).toHaveBeenCalledTimes(1)
    expect(button.classList.contains('show')).toBe(false)
    expect(button.getAttribute('tabindex')).toBe('-1')
    expect(button.getAttribute('aria-hidden')).toBe('true')
    expect(button.getAttribute('style')).toBeNull()

    scrollY.value = 120
    percentage.value = 0.52
    await nextTick()

    expect(button.classList.contains('show')).toBe(true)
    expect(button.getAttribute('tabindex')).toBe('0')
    expect(button.getAttribute('aria-hidden')).toBe('false')
    expect(button.getAttribute('style')).toBeNull()
    expect(button.style.getPropertyValue('--yun-back-top-progress')).toBe('')
  })

  it.each([
    { label: 'CSS.supports returns false', css: { supports: () => false } },
    { label: 'CSS global is undefined', css: undefined },
  ])('falls back to 1deg inline progress when $label', async ({ css }) => {
    vi.stubGlobal('CSS', css)

    const button = mountComponent()

    expect(mocks.useBackToTop).toHaveBeenCalledWith({ offset: 100 })
    expect(button.getAttribute('style')).toBeNull()

    scrollY.value = 150
    percentage.value = 0.52
    await nextTick()

    expect(button.classList.contains('show')).toBe(true)
    expect(button.style.getPropertyValue('--yun-back-top-progress')).toBe('187deg')

    percentage.value = 1.5
    await nextTick()
    expect(button.style.getPropertyValue('--yun-back-top-progress')).toBe('360deg')

    percentage.value = Number.NaN
    await nextTick()
    expect(button.style.getPropertyValue('--yun-back-top-progress')).toBe('')

    percentage.value = -0.2
    await nextTick()
    expect(button.style.getPropertyValue('--yun-back-top-progress')).toBe('')

    percentage.value = 0.5
    await nextTick()
    expect(button.style.getPropertyValue('--yun-back-top-progress')).toBe('180deg')

    percentage.value = 0
    await nextTick()
    expect(button.style.getPropertyValue('--yun-back-top-progress')).toBe('')
  })
})
