// @vitest-environment jsdom
import type { Post } from 'valaxy'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useArchiveYearNav } from '../../packages/valaxy-theme-yun/composables/archives'
import { groupPostsByYear } from '../../packages/valaxy-theme-yun/utils/archives'
import { normalizeTransitionPath, setupYunRouteTransition } from '../../packages/valaxy-theme-yun/utils/routeTransition'

vi.mock('valaxy', async () => {
  const { formatDate, orderByMeta } = await import('../../packages/valaxy/client/utils/time')
  return {
    formatDate,
    orderByMeta,
  }
})

describe('valaxy-theme-yun archives grouping', () => {
  const samplePosts: Post[] = [
    { title: '2024 A', path: '/posts/2024-a', date: '2024-03-10', updated: '2025-01-05' },
    { title: '2026 A', path: '/posts/2026-a', date: '2026-02-01', updated: '2026-02-01' },
    { title: '2026 B', path: '/posts/2026-b', date: '2026-08-15', updated: '2026-08-15' },
    { title: 'Hidden All', path: '/posts/hidden', date: '2026-09-01', hide: true },
    { title: 'Hidden Index', path: '/posts/hidden-index', date: '2025-05-01', hide: 'index' },
    { title: 'No Date', path: '/posts/no-date' },
  ]

  it('groups visible dated posts by year descending and ascending without mutating input', () => {
    const snapshot = [...samplePosts]
    const desc = groupPostsByYear(samplePosts, 'date', true)
    expect(desc.map(group => group.year)).toEqual([2026, 2025, 2024])
    expect(desc[0].posts.map(post => post.path)).toEqual(['/posts/2026-b', '/posts/2026-a'])
    expect(desc[1].posts.map(post => post.path)).toEqual(['/posts/hidden-index'])
    expect(desc[2].posts.map(post => post.path)).toEqual(['/posts/2024-a'])

    const asc = groupPostsByYear(samplePosts, 'date', false)
    expect(asc.map(group => group.year)).toEqual([2024, 2025, 2026])
    expect(asc[2].posts.map(post => post.path)).toEqual(['/posts/2026-a', '/posts/2026-b'])
    expect(samplePosts).toEqual(snapshot)
  })

  it('orders posts within a year by updated timestamp when configured', () => {
    const posts: Post[] = [
      { title: 'Earlier', path: '/posts/earlier', date: '2025-01-01', updated: '2025-12-01' },
      { title: 'Later', path: '/posts/later', date: '2025-06-01', updated: '2025-06-01' },
    ]
    const groups = groupPostsByYear(posts, 'updated', true)
    expect(groups).toHaveLength(1)
    expect(groups[0].posts.map(post => post.path)).toEqual(['/posts/earlier', '/posts/later'])
  })

  it('groups boundary timestamps using the configured site timezone', () => {
    const posts: Post[] = [
      { title: 'New Year Boundary', path: '/posts/boundary', date: '2025-12-31T20:00:00Z' },
    ]
    expect(groupPostsByYear(posts, 'date', true, 'UTC').map(group => group.year)).toEqual([2025])
    expect(groupPostsByYear(posts, 'date', true, 'Asia/Shanghai').map(group => group.year)).toEqual([2026])
  })

  it('jumps to a year heading, focuses it, and syncs router hash without desktop rail mounted', async () => {
    const heading = document.createElement('h2')
    heading.id = 'archive-year-2024'
    heading.scrollIntoView = vi.fn()
    document.body.appendChild(heading)

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/archives', component: defineComponent({ template: '<div />' }) }],
    })
    await router.push('/archives')
    await router.isReady()

    let navApi!: ReturnType<typeof useArchiveYearNav>
    const Host = defineComponent({
      setup() {
        const years = ref([
          { year: 2026, count: 2 },
          { year: 2024, count: 1 },
        ])
        const enabled = computed(() => true)
        navApi = useArchiveYearNav(years, enabled)
        return {}
      },
      template: '<div />',
    })

    const { createApp } = await import('vue')
    const mountEl = document.createElement('div')
    document.body.appendChild(mountEl)
    const app = createApp(Host)
    app.use(router)
    app.mount(mountEl)

    navApi.scrollToYear(2024)
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(navApi.activeYear.value).toBe(2024)
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(heading.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(heading)
    expect(router.currentRoute.value.hash).toBe('#archive-year-2024')

    app.unmount()
    mountEl.remove()
    heading.remove()
    vi.unstubAllGlobals()
  })
})

describe('valaxy-theme-yun route transition', () => {
  const Dummy = defineComponent({ template: '<div />' })
  let cleanup: (() => void) | undefined

  function createTestRouter() {
    return createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Dummy },
        { path: '/archives', component: Dummy },
        { path: '/posts/hello', component: Dummy },
      ],
    })
  }

  function stubMatchMedia(reduced = false) {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduce') ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
  }

  beforeEach(() => {
    document.documentElement.className = ''
    stubMatchMedia(false)
  })

  afterEach(() => {
    cleanup?.()
    cleanup = undefined
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.documentElement.className = ''
  })

  it('skips initial load, same-path queries, disabled config, reduced motion, and theme-reveal', async () => {
    const startViewTransition = vi.fn(() => ({
      ready: Promise.resolve(),
      finished: Promise.resolve(),
    }))
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
    })

    const router = createTestRouter()
    await router.push('/archives')
    await router.isReady()

    let enabled = true
    cleanup = setupYunRouteTransition(router, () => enabled)
    await Promise.resolve()

    expect(startViewTransition).not.toHaveBeenCalled()

    await router.push('/archives?sort=asc#archive-year-2025')
    expect(startViewTransition).not.toHaveBeenCalled()

    enabled = false
    await router.push('/posts/hello')
    expect(startViewTransition).not.toHaveBeenCalled()

    enabled = true
    document.documentElement.classList.add('theme-reveal')
    await router.push('/archives')
    expect(startViewTransition).not.toHaveBeenCalled()
    document.documentElement.classList.remove('theme-reveal')

    stubMatchMedia(true)
    await router.push('/posts/hello')
    expect(startViewTransition).not.toHaveBeenCalled()
  })

  it('wraps path navigation in startViewTransition and cleans up classes', async () => {
    let resolveFinished!: () => void
    const finished = new Promise<void>((resolve) => {
      resolveFinished = resolve
    })
    let hadClassInsideStart = false

    const startViewTransition = vi.fn((cb: () => void | Promise<void>) => {
      hadClassInsideStart = document.documentElement.classList.contains('yun-route-transition')
      void Promise.resolve().then(cb)
      return {
        ready: Promise.resolve(),
        finished,
      }
    })
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
    })

    const router = createTestRouter()
    await router.push('/archives')
    await router.isReady()

    cleanup = setupYunRouteTransition(router, () => true)
    await Promise.resolve()

    await router.push('/posts/hello')
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(hadClassInsideStart).toBe(true)

    resolveFinished()
    await finished
    await Promise.resolve()
    expect(document.documentElement.classList.contains('yun-route-transition')).toBe(false)
  })

  it('does not deadlock navigation when a view transition aborts or is skipped', async () => {
    const rejected = Promise.reject(new DOMException('Transition aborted', 'AbortError'))
    rejected.catch(() => {})

    const startViewTransition = vi.fn((cb: () => void | Promise<void>) => {
      void Promise.resolve().then(cb)
      return {
        ready: rejected,
        finished: rejected,
      }
    })
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
    })

    const router = createTestRouter()
    await router.push('/archives')
    await router.isReady()

    cleanup = setupYunRouteTransition(router, () => true)
    await Promise.resolve()

    await router.push('/posts/hello')
    expect(router.currentRoute.value.path).toBe('/posts/hello')

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.documentElement.classList.contains('yun-route-transition')).toBe(false)
  })

  it('applies and clears CSS fallback class when startViewTransition is unavailable', async () => {
    vi.useFakeTimers()
    Object.defineProperty(document, 'startViewTransition', {
      value: undefined,
      configurable: true,
    })

    const router = createTestRouter()
    await router.push('/archives')
    await router.isReady()

    cleanup = setupYunRouteTransition(router, () => true)
    await Promise.resolve()

    await router.push('/posts/hello')
    expect(document.documentElement.classList.contains('yun-route-fallback')).toBe(true)

    vi.advanceTimersByTime(300)
    expect(document.documentElement.classList.contains('yun-route-fallback')).toBe(false)
  })

  it('normalizes transition paths cleanly across edge cases', () => {
    expect(normalizeTransitionPath('/')).toBe('/')
    expect(normalizeTransitionPath('/archives/')).toBe('/archives')
    expect(normalizeTransitionPath('/posts/hello/?sort=asc#section')).toBe('/posts/hello')
    expect(normalizeTransitionPath('/posts/%E4%B8%AD%E6%96%87/')).toBe('/posts/中文')
    expect(normalizeTransitionPath('/posts/%E0%A4%A/')).toBe('/posts/%E0%A4%A')
    expect(normalizeTransitionPath('')).toBe('')
    expect(normalizeTransitionPath(undefined)).toBe('')
  })

  it('hands off and cleans up shared-element yun-post-title across navigation and abort', async () => {
    const visibleRect = () => ({
      width: 160,
      height: 28,
      top: 120,
      bottom: 148,
      left: 40,
      right: 200,
      x: 40,
      y: 120,
      toJSON: () => ({}),
    })
    const offscreenRect = () => ({
      width: 160,
      height: 28,
      top: -120,
      bottom: -92,
      left: 40,
      right: 200,
      x: 40,
      y: -120,
      toJSON: () => ({}),
    })

    const offscreenEl = document.createElement('span')
    offscreenEl.dataset.yunVtPostPath = '/posts/hello'
    offscreenEl.getBoundingClientRect = offscreenRect

    const oldTitleEl = document.createElement('span')
    oldTitleEl.dataset.yunVtPostPath = '/posts/hello'
    oldTitleEl.getBoundingClientRect = visibleRect

    const newTitleEl = document.createElement('span')
    newTitleEl.dataset.yunVtPageTitle = '/posts/hello'
    newTitleEl.getBoundingClientRect = visibleRect

    document.body.append(offscreenEl, oldTitleEl)

    let resolveFinished!: () => void
    const finished = new Promise<void>((resolve) => {
      resolveFinished = resolve
    })
    let cbPromise!: Promise<void> | void
    let oldHadNameBeforeCallback = false
    let offscreenSkipped = false

    const startViewTransition = vi.fn((cb: () => void | Promise<void>) => {
      oldHadNameBeforeCallback = oldTitleEl.style.viewTransitionName === 'yun-post-title'
      offscreenSkipped = offscreenEl.style.viewTransitionName === ''
      cbPromise = Promise.resolve().then(async () => {
        document.body.append(newTitleEl)
        await cb()
      })
      return {
        ready: Promise.resolve(),
        finished,
      }
    })
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
    })

    const router = createTestRouter()
    await router.push('/archives')
    await router.isReady()

    cleanup = setupYunRouteTransition(router, () => true)
    await Promise.resolve()

    await router.push('/posts/hello')
    await cbPromise

    expect(oldHadNameBeforeCallback).toBe(true)
    expect(offscreenSkipped).toBe(true)
    expect(oldTitleEl.style.viewTransitionName).toBe('')
    expect(newTitleEl.style.viewTransitionName).toBe('yun-post-title')

    resolveFinished()
    await finished
    await Promise.resolve()
    expect(newTitleEl.style.viewTransitionName).toBe('')

    // Abort cleanup
    const rejected = Promise.reject(new DOMException('Transition aborted', 'AbortError'))
    rejected.catch(() => {})
    const reverseStart = vi.fn((cb: () => void | Promise<void>) => {
      void Promise.resolve().then(cb)
      return { ready: rejected, finished: rejected }
    })
    Object.defineProperty(document, 'startViewTransition', {
      value: reverseStart,
      configurable: true,
    })

    await router.push('/archives')
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(newTitleEl.style.viewTransitionName).toBe('')
    expect(oldTitleEl.style.viewTransitionName).toBe('')
    offscreenEl.remove()
    oldTitleEl.remove()
    newTitleEl.remove()
  })

  it('does not let a cancelled older navigation release a newer pending transition', async () => {
    const callbacks: Array<() => void | Promise<void>> = []
    let nav2Finished = false

    const startViewTransition = vi.fn((cb: () => void | Promise<void>) => {
      const idx = callbacks.length
      callbacks.push(cb)
      return {
        ready: Promise.resolve(),
        finished: new Promise<void>(() => {
          // Intentionally resolved manually or kept open; track only via callback release
          void idx
        }),
      }
    })
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
    })

    const router = createTestRouter()
    await router.push('/archives')
    await router.isReady()

    cleanup = setupYunRouteTransition(router, () => true)
    await Promise.resolve()

    // Start Nav 1 without running its startViewTransition callback yet
    const nav1Promise = router.push('/posts/hello')
    await vi.waitFor(() => {
      expect(startViewTransition).toHaveBeenCalledTimes(1)
    })

    // Immediately start Nav 2, cancelling Nav 1; do NOT run Nav 2's callback yet
    const nav2Promise = router.push('/')
    await nav1Promise.catch(() => {})
    await vi.waitFor(() => {
      expect(startViewTransition).toHaveBeenCalledTimes(2)
    })

    // Run Nav 2's startViewTransition callback; nav1's abort must not have pre-released Nav 2
    const cb2Done = Promise.resolve(callbacks[1]()).then(() => {
      nav2Finished = true
    })
    await Promise.resolve()
    expect(nav2Finished).toBe(false)

    await nav2Promise
    await cb2Done
    expect(router.currentRoute.value.path).toBe('/')
    expect(nav2Finished).toBe(true)
  })

  it('does not let a canceled navigation callback clear activeOldTitleEl owned by a newer navigation', async () => {
    const visibleRect = () => ({
      width: 160,
      height: 28,
      top: 120,
      bottom: 148,
      left: 40,
      right: 200,
      x: 40,
      y: 120,
      toJSON: () => ({}),
    })

    const title1El = document.createElement('span')
    title1El.dataset.yunVtPostPath = '/posts/hello'
    title1El.getBoundingClientRect = visibleRect

    const title2El = document.createElement('span')
    title2El.dataset.yunVtPostPath = '/archives'
    title2El.getBoundingClientRect = visibleRect

    document.body.append(title1El, title2El)

    const callbacks: Array<() => void | Promise<void>> = []
    const startViewTransition = vi.fn((cb: () => void | Promise<void>) => {
      callbacks.push(cb)
      return {
        ready: Promise.resolve(),
        finished: new Promise<void>(() => {}),
      }
    })
    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
    })

    const router = createTestRouter()
    await router.push('/')
    await router.isReady()

    cleanup = setupYunRouteTransition(router, () => true)
    await Promise.resolve()

    const nav1Promise = router.push('/posts/hello')
    await vi.waitFor(() => {
      expect(startViewTransition).toHaveBeenCalledTimes(1)
    })
    expect(title1El.style.viewTransitionName).toBe('yun-post-title')

    const nav2Promise = router.push('/archives')
    await nav1Promise.catch(() => {})
    await vi.waitFor(() => {
      expect(startViewTransition).toHaveBeenCalledTimes(2)
    })
    expect(title2El.style.viewTransitionName).toBe('yun-post-title')

    // Canceled Nav 1's callback finally runs; it must NOT clear Nav 2's title2El
    await callbacks[0]()
    expect(title2El.style.viewTransitionName).toBe('yun-post-title')

    await callbacks[1]()
    await nav2Promise
    expect(title2El.style.viewTransitionName).toBe('')

    title1El.remove()
    title2El.remove()
  })
})
