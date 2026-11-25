import type { RouteLocationNormalized, Router } from 'vue-router'
import { nextTick } from 'vue'

const ROUTE_TRANSITION_CLASS = 'yun-route-transition'
const ROUTE_FALLBACK_CLASS = 'yun-route-fallback'
const THEME_REVEAL_CLASS = 'theme-reveal'
const SHARED_TITLE_TRANSITION_NAME = 'yun-post-title'
const SAFETY_TIMEOUT_MS = 1500
const FALLBACK_DURATION_MS = 260

type TitleDatasetProp = 'yunVtPostPath' | 'yunVtPageTitle'

interface ViewTransitionLike {
  ready?: Promise<unknown>
  finished?: Promise<unknown>
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Normalize a route or post path for stable shared-element View Transition matching.
 */
export function normalizeTransitionPath(path?: string): string {
  if (!path)
    return ''

  const rawPathname = path.split('#', 1)[0]?.split('?', 1)[0] ?? ''
  if (!rawPathname)
    return ''

  let decoded = rawPathname
  try {
    decoded = decodeURIComponent(rawPathname)
  }
  catch {
    decoded = rawPathname
  }

  if (decoded === '/')
    return '/'

  return decoded.replace(/\/+$/, '') || '/'
}

function findVisibleByDataset(attr: string, prop: TitleDatasetProp, targetPath: string): HTMLElement | null {
  if (!targetPath || typeof document === 'undefined' || typeof window === 'undefined')
    return null

  const candidates = document.querySelectorAll<HTMLElement>(`[${attr}]`)
  for (const el of candidates) {
    if (el.dataset[prop] !== targetPath)
      continue
    const rect = el.getBoundingClientRect()
    if (
      rect.width > 0
      && rect.height > 0
      && rect.bottom > 0
      && rect.top < window.innerHeight
      && rect.right > 0
      && rect.left < window.innerWidth
    ) {
      return el
    }
  }
  return null
}

interface PendingTransition {
  to: RouteLocationNormalized
  token: number
  release: (aborted?: boolean) => void
}

/**
 * Install smooth SPA route transitions using the View Transitions API with a
 * lightweight CSS entrance fallback when `startViewTransition` is unavailable.
 */
export function setupYunRouteTransition(router: Router, isEnabled: () => boolean) {
  let disposed = false
  let transitionToken = 0
  let pendingTransition: PendingTransition | undefined
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined
  let activeOldTitleEl: HTMLElement | undefined
  let activeNewTitleEl: HTMLElement | undefined
  let removeBeforeResolve: (() => void) | undefined
  let removeAfterEach: (() => void) | undefined
  let removeOnError: (() => void) | undefined

  function clearSharedTitle() {
    if (activeOldTitleEl) {
      activeOldTitleEl.style.viewTransitionName = ''
      activeOldTitleEl = undefined
    }
    if (activeNewTitleEl) {
      activeNewTitleEl.style.viewTransitionName = ''
      activeNewTitleEl = undefined
    }
  }

  function clearFallback() {
    if (fallbackTimer !== undefined) {
      clearTimeout(fallbackTimer)
      fallbackTimer = undefined
    }
    if (typeof document !== 'undefined')
      document.documentElement.classList.remove(ROUTE_FALLBACK_CLASS)
  }

  function releasePending() {
    const pending = pendingTransition
    pendingTransition = undefined
    pending?.release(true)
  }

  function installGuards() {
    if (disposed)
      return

    removeBeforeResolve = router.beforeResolve(async (to, from) => {
      if (typeof document === 'undefined' || disposed)
        return
      if (!isEnabled())
        return
      if (!from.matched.length || to.path === from.path)
        return
      if (document.visibilityState === 'hidden')
        return

      const root = document.documentElement
      if (root.classList.contains(THEME_REVEAL_CLASS))
        return
      if (prefersReducedMotion())
        return

      const startViewTransition = (document as Document & {
        startViewTransition?: (callback: () => void | Promise<void>) => ViewTransitionLike
      }).startViewTransition

      if (typeof startViewTransition !== 'function')
        return

      // Release any previous in-flight transition so rapid navigations never stall.
      releasePending()
      clearSharedTitle()
      clearFallback()

      const token = ++transitionToken
      const fromPath = normalizeTransitionPath(from.path)
      const toPath = normalizeTransitionPath(to.path)

      let expectedNewAttr: string | undefined
      let expectedNewProp: TitleDatasetProp | undefined
      let expectedNewPath: string | undefined

      const forwardEl = findVisibleByDataset('data-yun-vt-post-path', 'yunVtPostPath', toPath)
      if (forwardEl) {
        activeOldTitleEl = forwardEl
        forwardEl.style.viewTransitionName = SHARED_TITLE_TRANSITION_NAME
        expectedNewAttr = 'data-yun-vt-page-title'
        expectedNewProp = 'yunVtPageTitle'
        expectedNewPath = toPath
      }
      else {
        const reverseEl = findVisibleByDataset('data-yun-vt-page-title', 'yunVtPageTitle', fromPath)
        if (reverseEl) {
          activeOldTitleEl = reverseEl
          reverseEl.style.viewTransitionName = SHARED_TITLE_TRANSITION_NAME
          expectedNewAttr = 'data-yun-vt-post-path'
          expectedNewProp = 'yunVtPostPath'
          expectedNewPath = fromPath
        }
      }

      let navigationResolved = false
      let resolveNavigation!: () => void
      const readyToCommit = new Promise<void>((resolve) => {
        resolveNavigation = resolve
      })

      let domReleased = false
      let transitionSettled = false
      let resolveDomUpdate!: () => void
      const domUpdated = new Promise<void>((resolve) => {
        resolveDomUpdate = resolve
      })

      const safetyTimer = setTimeout(() => {
        finishDomUpdate(true)
      }, SAFETY_TIMEOUT_MS)

      function continueNavigation() {
        if (navigationResolved)
          return
        navigationResolved = true
        resolveNavigation()
      }

      function finishDomUpdate(aborted = false) {
        if (aborted)
          transitionSettled = true
        if (domReleased)
          return
        domReleased = true
        clearTimeout(safetyTimer)
        if (pendingTransition?.release === finishDomUpdate)
          pendingTransition = undefined
        continueNavigation()
        resolveDomUpdate()
      }

      pendingTransition = {
        to,
        token,
        release: finishDomUpdate,
      }
      root.classList.add(ROUTE_TRANSITION_CLASS)

      let transition: ViewTransitionLike | undefined
      try {
        transition = startViewTransition.call(document, async () => {
          continueNavigation()
          await domUpdated
          if (token === transitionToken && activeOldTitleEl) {
            activeOldTitleEl.style.viewTransitionName = ''
            activeOldTitleEl = undefined
          }
          if (!disposed && !transitionSettled && token === transitionToken && expectedNewAttr && expectedNewProp && expectedNewPath) {
            const newEl = findVisibleByDataset(expectedNewAttr, expectedNewProp, expectedNewPath)
            if (newEl) {
              activeNewTitleEl = newEl
              newEl.style.viewTransitionName = SHARED_TITLE_TRANSITION_NAME
            }
          }
        })
      }
      catch {
        transitionSettled = true
        finishDomUpdate(true)
        if (token === transitionToken) {
          clearSharedTitle()
          root.classList.remove(ROUTE_TRANSITION_CLASS)
        }
        return
      }

      Promise.resolve(transition?.ready).catch(() => {})
      Promise.resolve(transition?.finished).catch(() => {}).finally(() => {
        transitionSettled = true
        finishDomUpdate(true)
        if (token === transitionToken) {
          clearSharedTitle()
          root.classList.remove(ROUTE_TRANSITION_CLASS)
        }
      })

      await readyToCommit
    })

    removeAfterEach = router.afterEach(async (to, from, failure) => {
      if (typeof document === 'undefined' || disposed)
        return

      const pending = pendingTransition

      if (pending) {
        if (pending.to === to) {
          if (failure) {
            pending.release(true)
            return
          }
          await nextTick()
          await nextTick()
          if (pending.token === transitionToken && pendingTransition === pending)
            pending.release(false)
          return
        }

        if (failure)
          return
      }

      if (failure || !isEnabled() || !from.matched.length || to.path === from.path)
        return

      const root = document.documentElement
      if (root.classList.contains(THEME_REVEAL_CLASS) || prefersReducedMotion())
        return

      const hasNativeVT = typeof (document as Document & { startViewTransition?: unknown }).startViewTransition === 'function'
      if (!hasNativeVT) {
        clearFallback()
        root.classList.add(ROUTE_FALLBACK_CLASS)
        fallbackTimer = setTimeout(() => {
          root.classList.remove(ROUTE_FALLBACK_CLASS)
          fallbackTimer = undefined
        }, FALLBACK_DURATION_MS)
      }
    })

    removeOnError = router.onError((_error, to) => {
      if (!pendingTransition || !to || pendingTransition.to === to)
        releasePending()
    })
  }

  void router.isReady().then(installGuards).catch(() => {})

  return () => {
    disposed = true
    releasePending()
    clearSharedTitle()
    clearFallback()
    if (typeof document !== 'undefined')
      document.documentElement.classList.remove(ROUTE_TRANSITION_CLASS)
    removeBeforeResolve?.()
    removeAfterEach?.()
    removeOnError?.()
  }
}
