import { isClient } from '@vueuse/core'
import { useSiteConfig } from 'valaxy'
import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'

const MAX_POLL_ATTEMPTS = 25
const POLL_INTERVAL_MS = 16

const docSearchInitState = {
  initializing: false,
  ready: false,
  waiters: new Set<(ready: boolean) => void>(),
}

/**
 * Signal that lazy DocSearch initialization has begun so pending open requests wait
 * for listeners to mount instead of exhausting retry attempts prematurely.
 */
export function beginDocSearchInit() {
  docSearchInitState.initializing = true
  docSearchInitState.ready = false
}

/**
 * Signal that DocSearch initialization finished (either ready or failed/aborted).
 */
export function finishDocSearchInit(ready: boolean) {
  docSearchInitState.initializing = false
  docSearchInitState.ready = ready
  const callbacks = [...docSearchInitState.waiters]
  docSearchInitState.waiters.clear()
  for (const cb of callbacks)
    cb(ready)
}

/**
 * Reset shared DocSearch initialization coordination state (intended for isolated unit tests).
 */
export function resetDocSearchInitState() {
  docSearchInitState.initializing = false
  docSearchInitState.ready = false
  docSearchInitState.waiters.clear()
}

/**
 * init algolia watch
 */
export function useAddonAlgolia() {
  const siteConfig = useSiteConfig()
  const isAlgolia = computed(() => siteConfig.value.search.provider === 'algolia')

  // to avoid loading the docsearch js upfront (which is more than 1/3 of the
  // payload), we delay initializing it until the user has actually clicked or
  // hit the hotkey to invoke it.
  const loaded = ref(false)

  const docSearchModalRef = ref<HTMLDivElement>()
  let pollTimer: ReturnType<typeof setTimeout> | undefined
  let pollAttempts = 0
  let activeWaiter: ((ready: boolean) => void) | undefined

  function clearWaiter() {
    if (activeWaiter) {
      docSearchInitState.waiters.delete(activeWaiter)
      activeWaiter = undefined
    }
  }

  function clearPollTimer() {
    clearWaiter()
    if (pollTimer !== undefined) {
      clearTimeout(pollTimer)
      pollTimer = undefined
    }
  }

  function dispatchEvent() {
    if (!isClient)
      return

    // programmatically open the search box after initialize
    const e = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    })

    window.dispatchEvent(e)
  }

  /**
   * poll until open
   */
  function poll() {
    if (!isClient)
      return

    const existingModal = document.querySelector('.DocSearch-Modal')
    if (existingModal) {
      docSearchModalRef.value = existingModal as HTMLDivElement
      clearPollTimer()
      return
    }

    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      clearPollTimer()
      return
    }

    pollAttempts += 1
    // programmatically open the search box after initialize
    dispatchEvent()

    clearPollTimer()
    pollTimer = setTimeout(() => {
      pollTimer = undefined
      const docSearchModal = document.querySelector('.DocSearch-Modal')
      if (!docSearchModal)
        poll()
      else
        docSearchModalRef.value = docSearchModal as HTMLDivElement
    }, POLL_INTERVAL_MS)
  }

  function waitForInitThenPoll() {
    const waiter = (ready: boolean) => {
      activeWaiter = undefined
      if (ready) {
        pollAttempts = 0
        poll()
      }
    }
    activeWaiter = waiter
    docSearchInitState.waiters.add(waiter)
  }

  function load() {
    if (!isClient || loaded.value)
      return

    loaded.value = true
    pollAttempts = 0
    clearPollTimer()

    // Always defer initial polling so synchronous dispatchEvent() callers
    // (e.g. YunSearchTrigger.openSearch) cannot recursively re-enter hotkey listeners.
    pollTimer = setTimeout(() => {
      pollTimer = undefined
      if (docSearchInitState.initializing)
        waitForInitThenPoll()
      else
        poll()
    }, POLL_INTERVAL_MS)
  }

  if (getCurrentScope())
    onScopeDispose(clearPollTimer)

  return {
    isAlgolia,
    loaded,
    load,
    dispatchEvent,
    docSearchModalRef,
  }
}
