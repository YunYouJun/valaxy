import { computed, ref, watchEffect } from 'vue'
import { useFrontmatter } from './common'
import { useLayout, useMobile } from './layout'

/**
 * helper for sidebar
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

/**
 * dynamic left sidebar logic
 * - sidebar is hidden by default when home or mobile
 * - sidebar is shown by default when not home and not mobile
 * - sidebar can be toggled by user
 */
export function useDynamicLeftSidebar() {
  const layout = useLayout()
  const isMobile = useMobile()
  const isOpen = ref(isMobile.value ? false : layout.value !== 'home')

  watchEffect(() => {
    if (isMobile.value)
      close()
    else if (layout.value !== 'home')
      open()
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
    open,
    close,
    toggle,
  }
}
