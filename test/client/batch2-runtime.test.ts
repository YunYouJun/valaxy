// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, createApp, createSSRApp, defineComponent, effectScope, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { beginDocSearchInit, finishDocSearchInit, resetDocSearchInitState, useAddonAlgolia } from '../../packages/valaxy-addon-algolia/client/composable'
import { useTwikoo } from '../../packages/valaxy-addon-twikoo/client/twikoo'
import PressSidebarItem from '../../packages/valaxy-theme-press/components/PressSidebarItem.vue'
import { resetSidebarHashState } from '../../packages/valaxy-theme-press/composables/sidebar'
import ValaxyDecrypt from '../../packages/valaxy/client/components/ValaxyDecrypt.vue'

const clientEnv = vi.hoisted(() => ({ isClient: true }))
const routeState = vi.hoisted(() => ({ ref: null as any }))
const localeState = vi.hoisted(() => ({ ref: null as any }))
const siteConfigState = vi.hoisted(() => ({
  ref: null as any,
}))
const decryptMock = vi.hoisted(() => ({ decrypt: vi.fn(), runContentUpdated: vi.fn() }))

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    get isClient() {
      return clientEnv.isClient
    },
  }
})

vi.mock('vue-router', async () => {
  const { reactive: vueReactive } = await import('vue')
  routeState.ref ??= vueReactive({ path: '/posts/hello', hash: '' })
  return {
    useRoute: () => routeState.ref,
  }
})

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: localeState.ref ??= ref('en'),
    t: (key: string) => key,
  }),
}))

vi.mock('valaxy', async () => {
  const { ref: vueRef } = await import('vue')
  siteConfigState.ref ??= vueRef({
    search: { provider: 'algolia' },
    cdn: { prefix: 'https://cdn1.example.com/' },
    fuse: { dataPath: 'valaxy-fuse-list.json', options: { keys: ['title'] } },
  })
  return {
    useSiteConfig: () => siteConfigState.ref,
    useDecrypt: () => ({ decrypt: decryptMock.decrypt }),
    useFrontmatter: () => vueRef({}),
    runContentUpdated: decryptMock.runContentUpdated,
  }
})

const AppLink = defineComponent({
  setup: (_, { attrs, slots }) => () => h('a', attrs, slots.default?.()),
})

describe('batch 2 client runtime, hydration & cleanup', () => {
  const cleanups: (() => void)[] = []

  beforeEach(() => {
    clientEnv.isClient = true
    if (routeState.ref) {
      routeState.ref.path = '/posts/hello'
      routeState.ref.hash = ''
    }
    if (localeState.ref)
      localeState.ref.value = 'en'
    if (siteConfigState.ref) {
      siteConfigState.ref.value = {
        search: { provider: 'algolia' },
        cdn: { prefix: 'https://cdn1.example.com/' },
        fuse: { dataPath: 'valaxy-fuse-list.json', options: { keys: ['title'] } },
      }
    }
    resetSidebarHashState()
    resetDocSearchInitState()
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    window.history.replaceState({}, '', '/')
    delete (window as any).twikoo
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  afterEach(() => {
    for (const fn of cleanups.splice(0))
      fn()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('useAddonAlgolia caps polling retries, stops when modal opens, and clears timer on scope dispose', () => {
    vi.useFakeTimers()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    // 1. Finite retry cap when modal never opens
    const scope1 = effectScope()
    const algolia1 = scope1.run(() => useAddonAlgolia())!
    algolia1.load()
    vi.advanceTimersByTime(10000)
    expect(dispatchSpy.mock.calls.length).toBeLessThanOrEqual(25)
    expect(dispatchSpy.mock.calls.length).toBe(25)
    expect(vi.getTimerCount()).toBe(0)
    scope1.stop()

    // 2. Stops immediately once .DocSearch-Modal mounts
    dispatchSpy.mockClear()
    const scope2 = effectScope()
    const algolia2 = scope2.run(() => useAddonAlgolia())!
    algolia2.load()
    vi.advanceTimersByTime(16)
    const modal = document.createElement('div')
    modal.className = 'DocSearch-Modal'
    document.body.append(modal)
    vi.advanceTimersByTime(16)
    expect(algolia2.docSearchModalRef.value).toBe(modal)
    const callsWhenFound = dispatchSpy.mock.calls.length
    vi.advanceTimersByTime(500)
    expect(dispatchSpy.mock.calls.length).toBe(callsWhenFound)
    expect(vi.getTimerCount()).toBe(0)
    modal.remove()
    scope2.stop()

    // 3. Waits for slow lazy DocSearch initialization (> 400ms) instead of dropping the open request
    dispatchSpy.mockClear()
    const scopeSlow = effectScope()
    const algoliaSlow = scopeSlow.run(() => useAddonAlgolia())!
    algoliaSlow.load()
    beginDocSearchInit()
    vi.advanceTimersByTime(600)
    expect(dispatchSpy).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)

    const slowModalListener = () => {
      const m = document.createElement('div')
      m.className = 'DocSearch-Modal'
      document.body.append(m)
      window.removeEventListener('keydown', slowModalListener)
    }
    window.addEventListener('keydown', slowModalListener)
    finishDocSearchInit(true)
    expect(dispatchSpy).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(16)
    expect(algoliaSlow.docSearchModalRef.value).toBeInstanceOf(HTMLDivElement)
    expect(vi.getTimerCount()).toBe(0)
    scopeSlow.stop()
    document.body.innerHTML = ''
    resetDocSearchInitState()

    // 4. Re-entrant synchronous dispatchEvent from hotkey listener never recurses or overflows
    dispatchSpy.mockClear()
    const scopeReentrant = effectScope()
    const algoliaReentrant = scopeReentrant.run(() => useAddonAlgolia())!
    let hotkeyCalls = 0
    const handleSearchHotKey = (event: KeyboardEvent) => {
      if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        hotkeyCalls += 1
        algoliaReentrant.load()
        window.removeEventListener('keydown', handleSearchHotKey)
      }
    }
    window.addEventListener('keydown', handleSearchHotKey)
    algoliaReentrant.load()
    algoliaReentrant.dispatchEvent()
    expect(hotkeyCalls).toBe(1)
    expect(dispatchSpy).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(1)
    window.removeEventListener('keydown', handleSearchHotKey)
    scopeReentrant.stop()
    expect(vi.getTimerCount()).toBe(0)

    // 5. Disposing scope cancels pending timer cleanly
    dispatchSpy.mockClear()
    const scope3 = effectScope()
    const algolia3 = scope3.run(() => useAddonAlgolia())!
    algolia3.load()
    expect(vi.getTimerCount()).toBe(1)
    scope3.stop()
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(500)
    expect(dispatchSpy).not.toHaveBeenCalled()
  })

  it('useTwikoo guards unmount, missing custom el, reactive cdnPrefix swaps, and route/locale updates', async () => {
    const twikooInit = vi.fn()
    ;(window as any).twikoo = { init: twikooInit }

    const twikooOpts = ref<any>({ envId: 'env-1', el: '#custom-twikoo' })
    const container = document.createElement('div')
    document.body.append(container)

    const Comp = defineComponent({
      setup() {
        useTwikoo(computed(() => twikooOpts.value), '1.6.0')
        return () => h('div', { class: 'twikoo-host' })
      },
    })

    // 1. Unmount BEFORE script finishes loading cancels initialization and removes script tag
    const app1 = createApp(Comp)
    app1.mount(container)
    await nextTick()
    const script1 = document.head.querySelector('script[src*="cdn1.example.com"]') as HTMLScriptElement
    expect(script1).not.toBeNull()
    app1.unmount()
    expect(document.head.contains(script1)).toBe(false)
    script1.dispatchEvent(new Event('load'))
    await nextTick()
    expect(twikooInit).not.toHaveBeenCalled()

    // 2. Skips init when custom el is missing, runs once el exists, reacts to route/locale/cdnPrefix
    const app2 = createApp(Comp)
    app2.mount(container)
    await nextTick()
    const script2 = document.head.querySelector('script[src*="cdn1.example.com"]') as HTMLScriptElement
    expect(script2).not.toBeNull()
    script2.dispatchEvent(new Event('load'))
    await nextTick()
    expect(twikooInit).not.toHaveBeenCalled()

    const customTarget = document.createElement('div')
    customTarget.id = 'custom-twikoo'
    document.body.append(customTarget)

    routeState.ref.path = '/posts/updated'
    await nextTick()
    await nextTick()
    expect(twikooInit).toHaveBeenCalledTimes(1)
    expect(twikooInit).toHaveBeenLastCalledWith(expect.objectContaining({
      envId: 'env-1',
      el: '#custom-twikoo',
      path: '/posts/updated',
      lang: 'en',
    }))

    localeState.ref.value = 'zh-CN'
    await nextTick()
    await nextTick()
    expect(twikooInit).toHaveBeenCalledTimes(2)
    expect(twikooInit).toHaveBeenLastCalledWith(expect.objectContaining({ lang: 'zh-CN' }))

    // cdnPrefix change removes old script and injects new one
    siteConfigState.ref.value = {
      ...siteConfigState.ref.value,
      cdn: { prefix: 'https://cdn2.example.com/' },
    }
    await nextTick()
    expect(document.head.contains(script2)).toBe(false)
    const script3 = document.head.querySelector('script[src*="cdn2.example.com"]') as HTMLScriptElement
    expect(script3).not.toBeNull()
    script3.dispatchEvent(new Event('load'))
    await nextTick()
    await nextTick()
    expect(twikooInit).toHaveBeenCalledTimes(3)

    app2.unmount()
    expect(document.head.contains(script3)).toBe(false)
  })

  it('hydrates ValaxyDecrypt on HTTP without SSR mismatch warnings and preserves DOM nodes', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Server render phase (isClient === false)
    clientEnv.isClient = false
    const serverApp = createSSRApp(ValaxyDecrypt, { encryptedContent: 'cipher', hint: 'hint' })
    serverApp.component('ValaxyDynamicComponent', defineComponent({ setup: () => () => h('div') }))
    const ssrHtml = await renderToString(serverApp)
    expect(ssrHtml).not.toContain('Only works in HTTPS')

    // Client hydration phase under HTTP origin
    clientEnv.isClient = true
    expect(window.location.protocol).toBe('http:')
    const container = document.createElement('div')
    container.innerHTML = ssrHtml
    document.body.append(container)
    const preHydrationInput = container.querySelector('input')
    expect(preHydrationInput).not.toBeNull()

    const clientApp = createSSRApp(ValaxyDecrypt, { encryptedContent: 'cipher', hint: 'hint' })
    clientApp.component('ValaxyDynamicComponent', defineComponent({ setup: () => () => h('div') }))
    clientApp.mount(container)
    cleanups.push(() => clientApp.unmount())

    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    expect(container.querySelector('input')).toBe(preHydrationInput)

    await nextTick()
    expect(container.textContent).toContain('Only works in HTTPS')
  })

  it('hydrates PressSidebarItem hash links without mismatch and reacts to route.hash, hashchange, and unmount cleanup', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const item = {
      text: 'Guide',
      collapsed: true,
      items: [
        { text: 'Intro', link: '/guide#intro' },
        { text: 'Next', link: '/guide#next' },
      ],
    }

    // Server render
    clientEnv.isClient = false
    routeState.ref.path = '/guide'
    routeState.ref.hash = ''
    const serverApp = createSSRApp(PressSidebarItem, { item, depth: 0 })
    serverApp.component('AppLink', AppLink)
    const ssrHtml = await renderToString(serverApp)
    expect(ssrHtml).toContain('aria-expanded="false"')

    // Hydrate with initial URL containing #intro hash
    clientEnv.isClient = true
    window.history.replaceState({}, '', '/guide#intro')
    const container = document.createElement('div')
    container.innerHTML = ssrHtml
    document.body.append(container)
    const preHydrationButton = container.querySelector('button')

    const clientApp = createSSRApp(PressSidebarItem, { item, depth: 0 })
    clientApp.component('AppLink', AppLink)
    clientApp.mount(container)

    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
    expect(container.querySelector('button')).toBe(preHydrationButton)

    await nextTick()
    expect(container.querySelector('a[href="/guide#intro"]')?.className).toContain('is-active')
    expect(addSpy.mock.calls.filter(([t]) => t === 'hashchange')).toHaveLength(1)

    // Simulated router.push({ hash: '#next' }) updates reactive route.hash without hashchange event
    routeState.ref.hash = '#next'
    await nextTick()
    expect(container.querySelector('a[href="/guide#next"]')?.className).toContain('is-active')

    // Native hashchange event updates back to #intro
    window.history.replaceState({}, '', '/guide#intro')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(container.querySelector('a[href="/guide#intro"]')?.className).toContain('is-active')

    clientApp.unmount()
    expect(removeSpy.mock.calls.filter(([t]) => t === 'hashchange')).toHaveLength(1)
  })
})
