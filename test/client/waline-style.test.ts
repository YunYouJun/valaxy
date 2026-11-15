// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, ref } from 'vue'
import WalineClient from '../../packages/valaxy-addon-waline/components/WalineClient.vue'

const walineSdk = vi.hoisted(() => ({
  init: vi.fn(),
  commentCount: vi.fn(),
  pageviewCount: vi.fn(),
  instance: { update: vi.fn(), destroy: vi.fn() },
}))

vi.mock('@waline/client', () => ({
  init: walineSdk.init,
  commentCount: walineSdk.commentCount,
  pageviewCount: walineSdk.pageviewCount,
}))
vi.mock('@waline/client/waline.css?url', () => ({ default: '/assets/waline.test.css' }))
vi.mock('valaxy', () => ({ useAppStore: () => ({ isDark: false }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ locale: ref('en') }) }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/posts/hello' }) }))

let cleanup: (() => void) | undefined

beforeEach(() => {
  vi.clearAllMocks()
  walineSdk.init.mockReturnValue(walineSdk.instance)
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
})

function mountWaline() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const app = createApp(WalineClient, {
    options: { serverURL: 'https://waline.example' },
  })
  app.mount(container)
  return () => {
    app.unmount()
    container.remove()
  }
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('waline on-demand stylesheet loading', () => {
  it('inserts the stylesheet before theme styles, waits for load before init, and reuses it on remount', async () => {
    const themeLink = document.createElement('link')
    themeLink.rel = 'stylesheet'
    themeLink.href = '/assets/style.css'
    document.head.appendChild(themeLink)

    const unmountFirst = mountWaline()
    cleanup = unmountFirst

    const links = document.head.querySelectorAll<HTMLLinkElement>('link[data-valaxy-waline-style]')
    expect(links).toHaveLength(1)
    expect(links[0].rel).toBe('stylesheet')
    expect(links[0].getAttribute('href')).toBe('/assets/waline.test.css')
    expect(links[0].nextElementSibling).toBe(themeLink)
    expect(walineSdk.init).not.toHaveBeenCalled()

    links[0].dispatchEvent(new Event('load'))
    await flushPromises()
    expect(walineSdk.init).toHaveBeenCalledTimes(1)

    unmountFirst()
    cleanup = mountWaline()
    await flushPromises()

    expect(document.head.querySelectorAll('link[data-valaxy-waline-style]')).toHaveLength(1)
    expect(walineSdk.init).toHaveBeenCalledTimes(2)
  })

  it('skips init if unmounted before the stylesheet finishes loading', async () => {
    const unmount = mountWaline()
    const link = document.head.querySelector<HTMLLinkElement>('link[data-valaxy-waline-style]')!
    unmount()

    link.dispatchEvent(new Event('load'))
    await flushPromises()

    expect(walineSdk.init).not.toHaveBeenCalled()
  })
})
