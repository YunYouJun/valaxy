import type { Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

export function useActiveSidebarLinks(container: Ref<HTMLElement>, marker: Ref<HTMLElement>) {
  const onScroll = throttleAndDebounce(setActiveLink, 200)

  function setActiveLink(): void {
    const sidebarLinks = [].slice.call(
      document.querySelectorAll('.va-toc a.toc-link-item'),
    ) as HTMLAnchorElement[]

    const anchors = [].slice
      .call(document.querySelectorAll('main .header-anchor'))
      .filter((anchor: HTMLAnchorElement) =>
        sidebarLinks.some(sidebarLink => sidebarLink.hash === anchor.hash),
      ) as HTMLAnchorElement[]

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

  let prevActiveLink: HTMLAnchorElement | null = null

  function activateLink(hash: string | null): void {
    deactiveLink(prevActiveLink)

    const activeLink = (prevActiveLink
      = hash == null
        ? null
        : container.value.querySelector(`.va-toc a[href="${hash}"]`) as HTMLAnchorElement)

    // marker animation
    if (marker.value) {
      if (activeLink) {
        activeLink.classList.add('active')
        marker.value.style.opacity = '1'
        marker.value.style.top = `${activeLink.offsetTop + 2}px`
      }
      else {
        marker.value.style.opacity = '0'
        marker.value.style.top = '54px'
      }
    }
  }

  function deactiveLink(link: HTMLAnchorElement | null): void {
    link && link.classList.remove('active')
  }

  onMounted(() => {
    requestAnimationFrame(setActiveLink)
    window.addEventListener('scroll', onScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })
}

function getAnchorTop(anchor: HTMLAnchorElement): number {
  return anchor.parentElement!.offsetTop - 50
}

function isAnchorActive(
  index: number,
  anchor: HTMLAnchorElement,
  nextAnchor: HTMLAnchorElement,
): [boolean, string | null] {
  const scrollTop = window.scrollY

  if (index === 0 && scrollTop === 0)
    return [true, null]

  if (scrollTop < getAnchorTop(anchor))
    return [false, null]

  if (!nextAnchor || scrollTop < getAnchorTop(nextAnchor))
    return [true, decodeURIComponent(anchor.hash)]

  return [false, null]
}

function throttleAndDebounce(fn: () => void, delay: number): () => void {
  let timeout: number
  let called = false

  return () => {
    if (timeout)
      clearTimeout(timeout)

    if (!called) {
      fn()
      called = true
      setTimeout(() => {
        called = false
      }, delay)
    }
    else {
      // @ts-expect-error browser
      timeout = setTimeout(fn, delay)
    }
  }
}
