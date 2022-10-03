import type { Ref } from 'vue'
import { computed, inject, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import { useFrontmatter } from '../composables'
import { useThemeConfig } from '../../client'
import { throttleAndDebounce } from '../utils'
import type { DefaultThemeConfig, Header } from '../../types'

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

// function mapHeaders(
//   headers: HeaderWithChildren[],
// ): MenuItemWithLinkAndChildren[] {
//   return headers.map(header => ({
//     text: header.title,
//     link: `#${header.slug}`,
//     children: header.children ? mapHeaders(header.children) : undefined,
//     hidden: header.hidden,
//     lang: header.lang,
//   }))
// }

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

// magic number to avoid repeated retrieval
const PAGE_OFFSET = 56

export function useActiveAnchor(
  container: Ref<HTMLElement>,
  marker: Ref<HTMLElement>,
) {
  const onScroll = throttleAndDebounce(setActiveLink, 100)

  let prevActiveLink: HTMLAnchorElement | null = null

  onMounted(() => {
    requestAnimationFrame(setActiveLink)
    window.addEventListener('scroll', onScroll)
  })

  onUpdated(() => {
    // sidebar update means a route change
    activateLink(location.hash)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  function setActiveLink() {
    const links = [].slice.call(
      container.value.querySelectorAll('.outline-link'),
    ) as HTMLAnchorElement[]

    const anchors = [].slice
      .call(document.querySelectorAll('.content .header-anchor'))
      .filter((anchor: HTMLAnchorElement) => {
        return links.some((link) => {
          return link.hash === anchor.hash && anchor.offsetParent !== null
        })
      }) as HTMLAnchorElement[]

    const scrollY = window.scrollY
    const innerHeight = window.innerHeight
    const offsetHeight = container.value.offsetHeight
    const isBottom = (scrollY + innerHeight) === offsetHeight

    // console.log(scrollY, innerHeight, offsetHeight)
    // console.log(isBottom)

    // page bottom - highlight last one
    if (anchors.length && isBottom) {
      activateLink(null)
      return
    }

    // isTop
    if (anchors.length && scrollY === 0)
      activateLink('#')

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i]
      const nextAnchor = anchors[i + 1]

      const [isActive, hash] = isAnchorActive(i, anchor, nextAnchor)

      if (isActive) {
        history.replaceState(null, document.title, hash || ' ')
        activateLink(hash)
        return
      }
    }
  }

  function activateLink(hash: string | null) {
    if (prevActiveLink)
      prevActiveLink.classList.remove('active')

    if (hash !== null) {
      prevActiveLink = container.value.querySelector(
        `a[href="${decodeURIComponent(hash)}"]`,
      ) as HTMLAnchorElement
    }

    const activeLink = prevActiveLink

    const topOffset = 33

    if (activeLink) {
      activeLink.classList.add('active')
      marker.value.style.top = `${activeLink.offsetTop + topOffset}px`
      marker.value.style.opacity = '1'
    }
    else {
      marker.value.style.top = `${topOffset}px`
      marker.value.style.opacity = '0'
    }
  }
}

function getAnchorTop(anchor: HTMLAnchorElement): number {
  return anchor.parentElement!.offsetTop - PAGE_OFFSET - 15
}

function isAnchorActive(
  index: number,
  anchor: HTMLAnchorElement,
  nextAnchor: HTMLAnchorElement | undefined,
): [boolean, string | null] {
  const scrollTop = window.scrollY

  if (index === 0 && scrollTop === 0)
    return [true, null]

  if (scrollTop < getAnchorTop(anchor))
    return [false, null]

  if (!nextAnchor || scrollTop < getAnchorTop(nextAnchor))
    return [true, anchor.hash]

  return [false, null]
}

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
    headers,
    handleClick,
  }
}

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
