import { onMounted, onUnmounted, onUpdated } from 'vue'

// todo: refactor

export function useActiveSidebarLinks() {
  let rootActiveLink: HTMLAnchorElement | null = null
  let activeLink: HTMLAnchorElement | null = null

  const onScroll = throttleAndDebounce(setActiveLink, 200)

  function setActiveLink(): void {
    const sidebarLinks = getSidebarLinks()
    const anchors = getAnchors(sidebarLinks)

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

  function activateLink(hash: string | null): void {
    deactiveLink(activeLink)
    deactiveLink(rootActiveLink)

    activeLink = document.querySelector(`.va-toc a[href="${hash}"]`)

    if (!activeLink)
      return

    activeLink.classList.add('active')

    // also add active class to parent h2 anchors
    const rootLi = activeLink.closest('.right-sidebar-container > ul > li')

    if (rootLi && rootLi !== activeLink.parentElement) {
      rootActiveLink = rootLi.querySelector('a')
      rootActiveLink && rootActiveLink.classList.add('active')
    }
    else {
      rootActiveLink = null
    }
  }

  function deactiveLink(link: HTMLAnchorElement | null): void {
    link && link.classList.remove('active')
  }

  onMounted(() => {
    setActiveLink()
    window.addEventListener('scroll', onScroll)
  })

  onUpdated(() => {
    // sidebar update means a route change
    activateLink(decodeURIComponent(location.hash))
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })
}

function getSidebarLinks(): HTMLAnchorElement[] {
  return [].slice.call(
    document.querySelectorAll('.va-toc a.toc-link-item'),
  )
}

function getAnchors(sidebarLinks: HTMLAnchorElement[]): HTMLAnchorElement[] {
  return [].slice
    .call(document.querySelectorAll('.header-anchor'))
    .filter((anchor: HTMLAnchorElement) =>
      sidebarLinks.some(sidebarLink => sidebarLink.hash === anchor.hash),
    ) as HTMLAnchorElement[]
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
