import type { Ref } from 'vue'
import { computed, inject, ref } from 'vue'
import { useFrontmatter, useThemeConfig } from '../..'
import type { DefaultThemeConfig, Header } from '../../../types'

export type MenuItem = Omit<Header, 'slug' | 'children'> & {
  children?: MenuItem[]
}

export function resolveHeaders(
  headers: MenuItem[],
  levelsRange: Exclude<DefaultThemeConfig['outline'], false> = [2, 4],
) {
  const levels: [number, number]
    = typeof levelsRange === 'number'
      ? [levelsRange, levelsRange]
      : levelsRange === 'deep'
        ? [2, 6]
        : levelsRange

  return groupHeaders(headers, levels)
}

function groupHeaders(headers: MenuItem[], levelsRange: [number, number]) {
  const result: MenuItem[] = []

  headers = headers.map(h => ({ ...h }))
  headers.forEach((h, index) => {
    if (h.level >= levelsRange[0] && h.level <= levelsRange[1]) {
      if (addToParent(index, headers, levelsRange))
        result.push(h)
    }
  })

  return result
}

function addToParent(
  currIndex: number,
  headers: MenuItem[],
  levelsRange: [number, number],
) {
  if (currIndex === 0)
    return true

  const currentHeader = headers[currIndex]
  for (let index = currIndex - 1; index >= 0; index--) {
    const header = headers[index]

    if (
      header.level < currentHeader.level
      && header.level >= levelsRange[0]
      && header.level <= levelsRange[1]
    ) {
      if (header.children == null)
        header.children = []
      header.children.push(currentHeader)
      return false
    }
  }

  return true
}

/**
 * export headers & handleClick to generate outline
 * @returns
 */
export const useOutline = () => {
  const frontmatter = useFrontmatter()
  const themeConfig = useThemeConfig()
  const headers = ref<MenuItem[]>([])
  const pageOutline = computed<DefaultThemeConfig['outline']>(
    () => frontmatter.value.outline ?? themeConfig.value.outline,
  )

  const onContentUpdated = inject('onContentUpdated') as Ref<() => void>
  onContentUpdated.value = () => {
    headers.value = getHeaders(pageOutline.value)
  }

  const handleClick = ({ target: el }: Event) => {
    const id = `#${(el as HTMLAnchorElement).href!.split('#')[1]}`
    const heading = document.querySelector(
      decodeURIComponent(id),
    ) as HTMLAnchorElement
    heading?.focus()
  }

  return {
    /**
     * headers for toc
     */
    headers,
    /**
     * click hash heading
     */
    handleClick,
  }
}

/**
 * get headers from document directly
 * @param pageOutline
 * @returns
 */
export function getHeaders(pageOutline: DefaultThemeConfig['outline']) {
  if (pageOutline === false)
    return []
  const updatedHeaders: MenuItem[] = []
  document
    .querySelectorAll<HTMLHeadingElement>('h2, h3, h4, h5, h6')
    .forEach((el) => {
      if (el.textContent && el.id) {
        updatedHeaders.push({
          level: Number(el.tagName[1]),
          title: el.innerText.replace(/\s+#\s*$/, ''),
          link: `#${el.id}`,
          lang: el.lang,
        })
      }
    })
  return resolveHeaders(updatedHeaders, pageOutline)
}
