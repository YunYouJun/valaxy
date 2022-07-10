import type { Ref } from 'vue'
import { onMounted, onUnmounted, onUpdated } from 'vue'
import type { Header } from 'valaxy/types'
import { throttleAndDebounce } from 'valaxy'

interface HeaderWithChildren extends Header {
  children?: Header[]
  hidden?: boolean
}

interface MenuItemWithLinkAndChildren {
  text: string
  link: string
  children?: MenuItemWithLinkAndChildren[]
  hidden?: boolean
  lang?: string
}

export function resolveHeaders(headers: Header[]) {
  return mapHeaders(groupHeaders(headers))
}

function groupHeaders(headers: Header[]): HeaderWithChildren[] {
  headers = headers.map(h => Object.assign({}, h))

  let lastH2: HeaderWithChildren | undefined

  for (const h of headers) {
    if (h.level === 2)
      lastH2 = h

    else if (lastH2 && h.level <= 3)
      (lastH2.children || (lastH2.children = [])).push(h)
  }

  return headers.filter(h => h.level === 2)
}

function mapHeaders(
  headers: HeaderWithChildren[],
): MenuItemWithLinkAndChildren[] {
  return headers.map(header => ({
    text: header.title,
    link: `#${header.slug}`,
    children: header.children ? mapHeaders(header.children) : undefined,
    hidden: header.hidden,
    lang: header.lang,
  }))
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
    const offsetHeight = (document.querySelector('.yun-main') as HTMLElement)!.offsetHeight
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
