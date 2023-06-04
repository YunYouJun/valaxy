import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock'
import type { Ref } from 'vue'

export function useBodyScrollLock(screenRef?: Ref<HTMLElement | undefined>) {
  function lockBodyScroll() {
    disableBodyScroll((screenRef && screenRef.value) || document.body, { reserveScrollBarGap: true })
  }

  function unlockBodyScroll() {
    clearAllBodyScrollLocks()
  }

  return {
    lockBodyScroll,
    unlockBodyScroll,
  }
}
