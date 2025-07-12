import { useEventListener } from '@vueuse/core'
import { useFrontmatter, useSiteConfig } from 'valaxy'
import { onMounted } from 'vue'

/**
 * 获取未渲染元素的高度
 */
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

/**
 * 折叠代码块（允许设置最大高度）
 *
 * - 通过设置 `codeHeightLimit` 来限制代码块的高度
 */
export function useCollapseCode() {
  const config = useSiteConfig()
  const frontmatter = useFrontmatter()

  const codeHeightLimit = frontmatter.value.codeHeightLimit || config.value.codeHeightLimit
  if (typeof codeHeightLimit !== 'number' || codeHeightLimit <= 0) {
    return
  }

  useEventListener('click', (e) => {
    const el = e.target as HTMLElement
    if (el.matches('[class*="language-"] > button.collapse')) {
      const parent = el.parentElement
      parent?.classList.remove('folded')
      const codeHeightLimitClass = `max-h-${codeHeightLimit}px`
      parent?.classList.remove(codeHeightLimitClass)
    }
  })

  // determine whether to add folded class name
  onMounted(() => {
    const els = document.querySelectorAll('div[class*="language-"]')
    for (const el of Array.from(els)) {
      const elHeight = getHeightViaClone(el as HTMLElement)
      if (elHeight > codeHeightLimit)
        el.classList.add('folded')
    }
  })
}
