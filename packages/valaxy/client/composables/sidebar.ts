import { computed, ref } from 'vue'
import { useFrontmatter } from './common'
import { useLayout } from './layout'

/**
 * helper for sidebar
 * @inner
 */
export function useSidebar() {
  const isOpen = ref(false)
  const fm = useFrontmatter()
  const layout = useLayout()

  const hasSidebar = computed(() => {
    return (
      fm.value.sidebar !== false
      && layout.value !== 'home'
    )
  })

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  return {
    isOpen,
    hasSidebar,
    open,
    close,
    toggle,
  }
}
