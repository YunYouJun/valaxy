import type { Ref } from 'vue'
import { resolvedHeaders } from '@valaxyjs/utils'
import { onMounted, onUnmounted, onUpdated } from 'vue'
import { throttleAndDebounce } from '../../utils'
import { useAside } from '../aside'

// magic number to avoid repeated retrieval
const PAGE_OFFSET = 130
const topOffset = 33

function getAbsoluteTop(element: HTMLElement): number {
  let offsetTop = 0
  while (element !== document.body) {
    if (element === null) {
      // child element is:
      // - not attached to the DOM (display: none)
      // - set to fixed position (not scrollable)
      // - body or html element (null offsetParent)
      return Number.NaN
    }
    offsetTop += element.offsetTop
    element = element.offsetParent as HTMLElement
  }
  return offsetTop
}

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

  /**
   * 长目录自动滚动
   * @TODO add e2e test
   */
  const checkActiveLinkInViewport = () => {
    const activeLink = prevActiveLink
    if (!activeLink) {
      // container.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    const parentEl = document.querySelector('.yun-aside') as HTMLElement
    if (parentEl) {
      // 超出
      const top = activeLink.offsetTop + topOffset + 60
      if (top < parentEl.scrollTop || (top > parentEl.offsetHeight + parentEl.scrollTop))
        parentEl.scrollTo({ top, behavior: 'smooth' })
    }
  }

  function setActiveLink() {
    if (!isAsideEnabled.value)
      return

    const scrollY = window.scrollY
    const innerHeight = window.innerHeight
    const offsetHeight = document.body.offsetHeight
    const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1

    // resolvedHeaders may be repositioned, hidden or fix positioned
    const headers = resolvedHeaders
      .map(({ element, link }) => ({
        link,
        top: getAbsoluteTop(element),
      }))
      .filter(({ top }) => !Number.isNaN(top))
      .sort((a, b) => a.top - b.top)

    // no headers available for active link
    if (!headers.length) {
      activateLink(null)
      return
    }

    // page top
    if (scrollY < 1) {
      activateLink(null)
      return
    }

    // page bottom - highlight last link
    if (isBottom) {
      activateLink(headers[headers.length - 1].link)
      return
    }

    // find the last header above the top of viewport
    let activeLink: string | null = null
    for (const { link, top } of headers) {
      if (top > scrollY + 4 + PAGE_OFFSET)
        break

      activeLink = link
    }
    activateLink(activeLink)
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
      if (marker.value) {
        marker.value.style.top = `${topOffset}px`
        marker.value.style.opacity = '0'
      }
    }
  }
}
