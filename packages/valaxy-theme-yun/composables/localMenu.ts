import { shallowRef, watch } from 'vue'
import { useYunAppStore } from '../stores'

/** Keep a local navigation panel and the page outline mutually exclusive. */
export function useYunLocalMenu() {
  const yun = useYunAppStore()
  const menuOpen = shallowRef(false)

  function toggleMenu() {
    if (!menuOpen.value && yun.rightSidebar.isOpen)
      yun.rightSidebar.toggle()
    menuOpen.value = !menuOpen.value
  }

  watch(() => yun.rightSidebar.isOpen, (open) => {
    if (open)
      menuOpen.value = false
  })

  return { menuOpen, toggleMenu }
}
