import type { Ref } from 'vue'
import { resolvedHeaders } from '@valaxyjs/utils'
import { nextTick, onMounted, onUnmounted, shallowRef } from 'vue'
import { onContentUpdated, throttleAndDebounce } from '../../utils'
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

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

/**
 * Themes render outline links either as plain `#id` anchors or as RouterLinks
 * whose href includes the page path, so compare decoded hashes instead of hrefs.
 */
function findLinkByHash(container: HTMLElement, hash: string): HTMLAnchorElement | null {
  const target = safeDecode(hash)
  return [...container.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')]
    .find(link => safeDecode(link.hash) === target) ?? null
}

/**
 * When the active outline link sits inside a collapsed branch, walk up to
 * the nearest expanded ancestor item so the indicator tracks a visible row.
 */
function resolveVisibleLink(link: HTMLAnchorElement): HTMLAnchorElement {
  let cur: HTMLAnchorElement = link
  while (true) {
    const collapsedBranch = cur.closest('[data-outline-collapsed="true"]')
    if (!collapsedBranch)
      return cur

    const parentItem = collapsedBranch.closest('.va-toc-item')
    const parentLink = parentItem?.querySelector<HTMLAnchorElement>(
      ':scope > a[href*="#"]',
    )
    if (!parentLink || parentLink === cur)
      return cur

    cur = parentLink
  }
}

function getRelativeTop(element: HTMLElement, ancestor: HTMLElement): number | null {
  let top = 0
  let cur: HTMLElement | null = element
  while (cur && cur !== ancestor) {
    top += cur.offsetTop
    cur = cur.offsetParent as HTMLElement | null
  }
  return cur === ancestor ? top : null
}

/**
 * Compute the marker's `top` offset relative to its containing block so
 * alignment stays accurate whether the outline header is visible, taller, or hidden.
 */
export function resolveOutlineMarkerTop(
  visibleLink: HTMLElement,
  markerEl: HTMLElement,
  fallbackOffset = topOffset,
): number {
  const markerParent = markerEl.offsetParent as HTMLElement | null
  if (markerParent) {
    const relativeTop = getRelativeTop(visibleLink, markerParent)
    if (relativeTop !== null) {
      const centerOffset = visibleLink.offsetHeight && markerEl.offsetHeight
        ? Math.round((visibleLink.offsetHeight - markerEl.offsetHeight) / 2)
        : 5
      return relativeTop + centerOffset
    }
  }
  return visibleLink.offsetTop + fallbackOffset
}

export function useActiveAnchor(
  container: Ref<HTMLElement>,
  marker: Ref<HTMLElement>,
) {
  const { isAsideEnabled } = useAside()
  const onScroll = throttleAndDebounce(setActiveLink, 100)
  const activeLink = shallowRef<string | null>(null)

  let prevActiveLink: HTMLAnchorElement | null = null
  let resizeObserver: ResizeObserver | undefined

  const onHashChange = () => {
    activateLink(location.hash || null)
  }

  onMounted(() => {
    requestAnimationFrame(setActiveLink)
    window.addEventListener('scroll', onScroll)
    window.addEventListener('hashchange', onHashChange)
    if (typeof ResizeObserver !== 'undefined' && container.value) {
      resizeObserver = new ResizeObserver(() => refreshMarker())
      resizeObserver.observe(container.value)
    }
  })

  onContentUpdated(() => {
    void nextTick(() => {
      if (location.hash)
        activateLink(location.hash)
      else
        setActiveLink()
    })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('hashchange', onHashChange)
    resizeObserver?.disconnect()
    resizeObserver = undefined
  })

  /**
   * 长目录自动滚动
   * @see e2e/theme-yun/outline.spec.ts
   */
  const checkActiveLinkInViewport = () => {
    const visibleLink = prevActiveLink ? resolveVisibleLink(prevActiveLink) : null
    if (!visibleLink)
      return

    const parentEl = document.querySelector('.yun-aside') as HTMLElement
    if (parentEl) {
      // 超出
      const top = (marker.value ? resolveOutlineMarkerTop(visibleLink, marker.value) : visibleLink.offsetTop + topOffset) + 60
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
      activateLink(headers.at(-1)?.link || null)
      return
    }

    // find the last header above the top of viewport
    let currentHash: string | null = null
    for (const { link, top } of headers) {
      if (top > scrollY + 4 + PAGE_OFFSET)
        break

      currentHash = link
    }
    activateLink(currentHash)
  }

  function updateMarkerPosition(targetLink: HTMLAnchorElement | null) {
    if (!marker.value)
      return

    const visibleLink = targetLink ? resolveVisibleLink(targetLink) : null
    if (visibleLink) {
      marker.value.style.top = `${resolveOutlineMarkerTop(visibleLink, marker.value)}px`
      marker.value.style.opacity = '1'
    }
    else {
      marker.value.style.top = `${topOffset}px`
      marker.value.style.opacity = '0'
    }
  }

  function refreshMarker() {
    if (!container.value)
      return
    updateMarkerPosition(prevActiveLink)
  }

  function activateLink(hash: string | null) {
    activeLink.value = hash || null

    if (prevActiveLink)
      prevActiveLink.classList.remove('active')

    prevActiveLink = hash && container.value ? findLinkByHash(container.value, hash) : null

    const currentLink = prevActiveLink
    checkActiveLinkInViewport()

    if (currentLink)
      currentLink.classList.add('active')

    updateMarkerPosition(currentLink)
  }

  return {
    activeLink,
    refreshMarker,
  }
}
