import { useEventListener } from '@vueuse/core'
import { useFrontmatter, useSiteConfig } from 'valaxy'
import { onMounted } from 'vue'

function getHeightViaClone(el: HTMLElement) {
  const clone = el.cloneNode(true) as HTMLElement
  clone.style.cssText = `
      position: absolute;
      visibility: hidden;
      display: block;
      left: -9999px;
  `
  document.body.appendChild(clone)
  const height = clone.scrollHeight
  document.body.removeChild(clone)
  return height
}

export function useCollapseCode() {
  const config = useSiteConfig()
  const frontmatter = useFrontmatter()

  useEventListener('click', (e) => {
    const el = e.target as HTMLElement
    if (el.matches('[class*="language-"] > button.collapse')) {
      const parent = el.parentElement
      parent?.removeAttribute('style')
      parent?.classList.remove('folded')
    }
  })

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
      const elHeight = getHeightViaClone(el as HTMLElement)
      if (elHeight > codeHeightLimit)
        el.classList.add('folded')
    }
  })
}
