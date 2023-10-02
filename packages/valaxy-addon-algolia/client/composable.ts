import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSiteConfig } from 'valaxy'

/**
 * init algolia watch
 */
export function useAddonAlgolia() {
  const siteConfig = useSiteConfig()
  const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')
  const metaKey = ref('\'Meta\'')

  // to avoid loading the docsearch js upfront (which is more than 1/3 of the
  // payload), we delay initializing it until the user has actually clicked or
  // hit the hotkey to invoke it.
  const loaded = ref(false)

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
      if (!document.querySelector('.DocSearch-Modal'))
        poll()
    }, 16)
  }

  function load() {
    if (!loaded.value) {
      loaded.value = true
      setTimeout(poll, 16)
    }
  }

  onMounted(() => {
    if (!isAlgolia.value)
      return

    // meta key detect (same logic as in @docsearch/js)
    metaKey.value = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
      ? '\'⌘\''
      : '\'Ctrl\''

    const handleSearchHotKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        load()
        // eslint-disable-next-line ts/no-use-before-define
        remove()
      }
    }

    const remove = () => {
      window.removeEventListener('keydown', handleSearchHotKey)
    }
    window.addEventListener('keydown', handleSearchHotKey)

    onUnmounted(remove)
  })

  return {
    isAlgolia,
    loaded,
    metaKey,
    load,
    dispatchEvent,
  }
}
