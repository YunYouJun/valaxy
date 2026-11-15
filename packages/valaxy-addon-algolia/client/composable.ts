import { isClient } from '@vueuse/core'
import { useSiteConfig } from 'valaxy'
import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'

const MAX_POLL_ATTEMPTS = 25
const POLL_INTERVAL_MS = 16

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

  function clearPollTimer() {
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

  function load() {
    if (!isClient)
      return

    if (!loaded.value) {
      loaded.value = true
      pollAttempts = 0
      clearPollTimer()
      pollTimer = setTimeout(() => {
        pollTimer = undefined
        poll()
      }, POLL_INTERVAL_MS)
    }
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
