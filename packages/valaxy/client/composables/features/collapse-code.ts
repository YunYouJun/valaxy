import { isClient } from '@vueuse/core'
import { onMounted } from 'vue'
import { useFrontmatter, useSiteConfig } from 'valaxy'

export function useCollapseCode() {
  const config = useSiteConfig()
  const frontmatter = useFrontmatter()

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

  // determine whether to add folded class name
  onMounted(() => {
    const els = document.querySelectorAll('div[class*="language-"]')
    const siteConfigLimit = config.value.codeHeightLimit
    const frontmatterLimit = frontmatter.value.codeHeightLimit
    let codeHeightLimit: number

    if (typeof frontmatterLimit !== 'number' || frontmatterLimit <= 0) {
      if (siteConfigLimit === undefined || siteConfigLimit <= 0)
        return
      else
        codeHeightLimit = siteConfigLimit
    }
    else {
      codeHeightLimit = frontmatterLimit
    }

    for (const el of Array.from(els)) {
      if (el.scrollHeight > codeHeightLimit)
        el.classList.add('folded')
    }
  })
}
