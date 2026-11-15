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

  it('reuses and repositions a loaded SSG-emitted stylesheet appearing after theme styles', async () => {
    const themeLink = document.createElement('link')
    themeLink.rel = 'stylesheet'
    themeLink.href = '/assets/style.css'
    document.head.appendChild(themeLink)

    const ssgWalineLink = document.createElement('link')
    ssgWalineLink.rel = 'stylesheet'
    ssgWalineLink.href = '/assets/waline.test.css'
    Object.defineProperty(ssgWalineLink, 'sheet', { value: {}, configurable: true })
    document.head.appendChild(ssgWalineLink)

    cleanup = mountWaline()

    const links = document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href="/assets/waline.test.css"]')
    expect(links).toHaveLength(1)
    expect(links[0]).toBe(ssgWalineLink)
    expect(ssgWalineLink.hasAttribute('data-valaxy-waline-style')).toBe(true)
    expect(ssgWalineLink.nextElementSibling).toBe(themeLink)

    await flushPromises()
    expect(walineSdk.init).toHaveBeenCalledTimes(1)
  })

  it('recovers when a pre-existing stylesheet has no loaded sheet (e.g. failed before mount)', async () => {
    const preFailedLink = document.createElement('link')
    preFailedLink.rel = 'stylesheet'
    preFailedLink.href = '/assets/waline.test.css'
    document.head.appendChild(preFailedLink)
    preFailedLink.dispatchEvent(new Event('error'))

    const themeLink = document.createElement('link')
    themeLink.rel = 'stylesheet'
    themeLink.href = '/assets/style.css'
    document.head.appendChild(themeLink)

    const unmountFirst = mountWaline()
    cleanup = unmountFirst

    const retriedLinks = document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href="/assets/waline.test.css"]')
    expect(retriedLinks).toHaveLength(1)
    expect(retriedLinks[0]).not.toBe(preFailedLink)
    expect(retriedLinks[0].hasAttribute('data-valaxy-waline-style')).toBe(true)
    expect(retriedLinks[0].nextElementSibling).toBe(themeLink)

    retriedLinks[0].dispatchEvent(new Event('error'))
    await flushPromises()
    expect(walineSdk.init).toHaveBeenCalledTimes(1)

    unmountFirst()
    cleanup = mountWaline()
    await flushPromises()
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

  it('propagates meta[property="csp-nonce"] to created and replaced stylesheet links', async () => {
    const nonceMeta = document.createElement('meta')
    nonceMeta.setAttribute('property', 'csp-nonce')
    nonceMeta.setAttribute('nonce', 'test-csp-nonce')
    document.head.appendChild(nonceMeta)

    const unmount = mountWaline()
    const link = document.head.querySelector<HTMLLinkElement>('link[data-valaxy-waline-style]')!
    expect(link.getAttribute('nonce')).toBe('test-csp-nonce')
    expect(link.nonce).toBe('test-csp-nonce')

    link.dispatchEvent(new Event('load'))
    await flushPromises()
    unmount()
  })
})
