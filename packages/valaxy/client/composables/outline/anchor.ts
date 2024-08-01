import type { Ref } from 'vue'
import { onMounted, onUnmounted, onUpdated } from 'vue'
import { throttleAndDebounce } from '../../utils'
import { useAside } from '../aside'

// magic number to avoid repeated retrieval
const PAGE_OFFSET = 56
const topOffset = 33

export function useActiveAnchor(
  container: Ref<HTMLElement>,
  marker: Ref<HTMLElement>,
) {
  const { isAsideEnabled } = useAside()
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
    if (!isAsideEnabled.value)
      return

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
    const offsetHeight = document.body.offsetHeight
    const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1

    // page bottom - highlight last one
    if (anchors.length && isBottom) {
      activateLink(anchors[anchors.length - 1].hash)
      // activateLink(null)
      return
    }

    // isTop
    // if (anchors.length && scrollY === 0)
    //   activateLink('#')

    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i]
      const nextAnchor = anchors[i + 1]

      const [isActive, hash] = isAnchorActive(i, anchor, nextAnchor)

      if (isActive) {
        activateLink(hash)
        return
      }
    }
  }

  const checkActiveLinkInViewport = () => {
    const activeLink = prevActiveLink
    if (!activeLink) {
      // container.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const top = activeLink.getBoundingClientRect().top
    const bottom = activeLink.getBoundingClientRect().bottom

    if (top < topOffset || bottom > window.innerHeight - topOffset)
      activeLink.scrollIntoView()
  }

  function activateLink(hash: string | null) {
    if (prevActiveLink)
      prevActiveLink.classList.remove('active')

    if (hash == null) {
      prevActiveLink = null
    }
    else {
      prevActiveLink = container.value.querySelector(
        `a[href="${decodeURIComponent(hash)}"]`,
      )
    }

    const activeLink = prevActiveLink
    checkActiveLinkInViewport()

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
