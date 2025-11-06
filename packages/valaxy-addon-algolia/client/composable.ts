import { useSiteConfig } from 'valaxy'
import { computed, ref } from 'vue'

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

  function dispatchEvent() {
    // programmatically open the search box after initialize
    const e = new Event('keydown') as any

    e.key = 'k'
    e.metaKey = true

    window.dispatchEvent(e)
  }

  /**
   * poll until open
   */
  function poll() {
    // programmatically open the search box after initialize
    dispatchEvent()

    setTimeout(() => {
      const docSearchModal = document.querySelector('.DocSearch-Modal')
      if (!docSearchModal)
        poll()
      else
        docSearchModalRef.value = docSearchModal as HTMLDivElement
    }, 16)
  }

  function load() {
    if (!loaded.value) {
      loaded.value = true
      setTimeout(poll, 16)
    }
  }

  return {
    isAlgolia,
    loaded,
    load,
    dispatchEvent,
    docSearchModalRef,
  }
}
