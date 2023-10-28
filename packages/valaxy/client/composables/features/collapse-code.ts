import { isClient } from '@vueuse/core'
import { onMounted } from 'vue'
import { useSiteConfig } from 'valaxy'

export function useCollapseCode() {
  const config = useSiteConfig()

  if (isClient) {
    window.addEventListener('click', (e) => {
      const el = e.target as HTMLElement
      if (el.matches('[class*="language-"] > button.collapse')) {
        const parent = el.parentElement
        parent?.removeAttribute('style')
        parent?.classList.remove('folded')
      }
    })
  }

  onMounted(() => {
    const els = document.querySelectorAll('div[class*="language-"]')
    const codeHeightLimit = config.value.codeHeightLimit
    if (codeHeightLimit === undefined)
      return

    for (const el of Array.from(els)) {
      if (el.scrollHeight > codeHeightLimit)
        el.classList.add('folded')
    }
  })
}
