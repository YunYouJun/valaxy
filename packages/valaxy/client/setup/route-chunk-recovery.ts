import type { Router } from 'vue-router'
import { START_LOCATION } from 'vue-router'

export function setupRouteChunkRecovery(router: Router): () => void {
  const preloadErrors = new WeakSet<Error>()
  let recovering = false
  let traversedPath: string | undefined
  let finishRecovery: (() => void) | undefined

  function recordPreloadError(event: Event) {
    const { payload } = event as Event & { payload?: unknown }
    if (payload instanceof Error)
      preloadErrors.add(payload)
  }

  function resetAfterRestore(event: PageTransitionEvent) {
    if (event.persisted)
      recovering = false
  }

  window.addEventListener('vite:preloadError', recordPreloadError)
  window.addEventListener('pageshow', resetAfterRestore)
  const removeHistoryListener = router.options.history.listen((to, _from, { delta }) => {
    traversedPath = delta ? to : undefined
  })
  const removeAfterEach = router.afterEach(() => {
    traversedPath = undefined
  })
  const removeRouterErrorHandler = router.onError((error, to, from) => {
    // Registering an error handler replaces Vue Router's default error logging.
    console.error(error)

    // The new document starts at START_LOCATION, so a persistent 404 cannot loop.
    if (recovering || from === START_LOCATION || !preloadErrors.has(error))
      return

    const { location } = window
    const target = new URL(router.resolve(to.fullPath).href, location.href)
    const sameDocument = target.pathname === location.pathname && target.search === location.search
    if (target.origin !== location.origin || (sameDocument && target.href !== location.href))
      return

    recovering = true
    function navigate() {
      finishRecovery = undefined
      if (target.href === location.href)
        location.reload()
      else
        location.assign(target.href)
    }

    // Vue Router queues a history rollback before reporting a failed traversal.
    if (sameDocument && traversedPath === to.fullPath) {
      finishRecovery = navigate
      window.addEventListener('popstate', navigate, { once: true })
    }
    else {
      navigate()
    }
  })

  return () => {
    window.removeEventListener('vite:preloadError', recordPreloadError)
    window.removeEventListener('pageshow', resetAfterRestore)
    if (finishRecovery)
      window.removeEventListener('popstate', finishRecovery)
    removeHistoryListener()
    removeAfterEach()
    removeRouterErrorHandler()
  }
}
