import { computed, shallowRef } from 'vue'
import type { DefaultTheme, Header } from 'valaxy/types'
import { onContentUpdated } from '../../utils'
import { useFrontmatter, useThemeConfig } from '../..'

/**
 * @en
 * Menu item, the title menu parsed from the article.
 *
 * @zh
 * 菜单项，从文章中解析出的标题菜单。
 */
export type MenuItem = Omit<Header, 'slug' | 'children'> & {
  children?: MenuItem[]
}

export function resolveHeaders(
  headers: MenuItem[],
  levelsRange: Exclude<DefaultTheme.Config['outline'], false> = [2, 4],
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
 */
export function useOutline() {
  const frontmatter = useFrontmatter()
  const themeConfig = useThemeConfig()
  const headers = shallowRef<MenuItem[]>([])
  const pageOutline = computed<DefaultTheme.Config['outline']>(
    () => frontmatter.value.outline ?? themeConfig.value.outline,
  )

  onContentUpdated(() => {
    if (pageOutline.value === false)
      return
    headers.value = getHeaders(pageOutline.value)
  })

  const handleClick = ({ target: el }: Event) => {
    const id = (el as HTMLAnchorElement).href!.split('#')[1]
    const heading = document.getElementById(
      decodeURIComponent(id),
    ) as HTMLAnchorElement
    heading?.focus({
      preventScroll: true,
    })
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
 */
export function getHeaders(range: Exclude<DefaultTheme.Config['outline'], false>) {
  const headers = Array.from(document.querySelectorAll('.markdown-body :where(h1,h2,h3,h4,h5,h6)'))
    .filter(el => el.id && el.hasChildNodes())
    .map((el) => {
      const level = Number(el.tagName[1])
      return {
        title: serializeHeader(el),
        link: `#${el.id}`,
        level,
        // @ts-expect-error lang
        lang: el.lang,
      }
    })

  return resolveHeaders(headers, range)
}

function serializeHeader(h: Element): string {
  let ret = ''
  for (const node of Array.from(h.childNodes)) {
    if (node.nodeType === 1) {
      if (
        (node as Element).classList.contains('VABadge')
        || (node as Element).classList.contains('header-anchor')
      )
        continue

      ret += node.textContent
    }
    else if (node.nodeType === 3) {
      ret += node.textContent
    }
  }
  return ret.trim()
}
