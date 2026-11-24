import type { Router } from 'vue-router'
import { copyToClipboard } from './clipboard'

/**
 * @en
 * Options for scrolling to a target element.
 *
 * @zh
 * 滚动到目标元素的选项。
 */
export interface ScrollToOptions {
  /**
   * @en
   * Whether to scroll smoothly.
   *
   * @zh
   * 平滑滚动
   */
  smooth: boolean
  /**
   * 滚动目标的 padding
   */
  targetPadding: number
}

function parseScrollMargin(value?: string): number | null {
  if (!value)
    return null
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed !== 0 ? parsed : null
}

function resolveTargetPadding(target: Element, targetPadding?: number): number {
  // Preserve legacy falsy `0` behavior (e.g. theme-press exports targetPadding = 0)
  // so `0` falls through to the element's CSS scroll-margin before defaulting to -64.
  if (typeof targetPadding === 'number' && Number.isFinite(targetPadding) && targetPadding !== 0)
    return targetPadding

  const styles = window.getComputedStyle(target)
  const margin = parseScrollMargin(styles.scrollMarginTop)
    ?? parseScrollMargin(styles.scrollMarginBlockStart)
  return margin !== null ? -margin : -64
}

/**
 * For theme developers, you can use this function to scroll to the target element.
 * For example, when you click the anchor link in the markdown file, it will scroll to the target element.
 * @param el
 * @param hash
 * @param options
 */
export function scrollTo(el: HTMLElement, hash: string, options: Partial<ScrollToOptions> = {
  smooth: true,
}) {
  let target: Element | null = null
  try {
    target = el.classList.contains('header-anchor')
      ? (el.closest('h1, h2, h3, h4, h5, h6') || el)
      : ((decodeURIComponent(hash) && document.querySelector(decodeURIComponent(hash))) || null)
  }
  catch (e) {
    console.warn(e)
  }

  if (target) {
    const targetPadding = resolveTargetPadding(target, options?.targetPadding)
    const targetTop
      = window.scrollY
        + (target as HTMLElement).getBoundingClientRect().top
        + targetPadding

    // only smooth scroll if distance is smaller than screen height.
    if (!options.smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight) {
      window.scrollTo(0, targetTop)
    }
    else {
      window.scrollTo({
        // left: 0,
        top: targetTop,
        behavior: 'smooth',
      })
    }
  }
}

interface ClickHandlerEntry {
  refCount: number
  detach: () => void
}

const activeClickHandlers = new WeakMap<Router, ClickHandlerEntry>()

const HEADER_ANCHOR_COPIED_DURATION = 1600
const copiedAnchorTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>()

function copyHeaderAnchorLink(link: HTMLAnchorElement) {
  const url = link.href || window.location.href
  void copyToClipboard(url).then((copied) => {
    if (!copied)
      return

    const prevTimer = copiedAnchorTimers.get(link)
    if (prevTimer)
      clearTimeout(prevTimer)

    if (link.classList.contains('is-copied')) {
      link.classList.remove('is-copied')
      void link.offsetWidth
    }

    link.classList.add('is-copied')
    const timer = setTimeout(() => {
      link.classList.remove('is-copied')
      copiedAnchorTimers.delete(link)
    }, HEADER_ANCHOR_COPIED_DURATION)
    copiedAnchorTimers.set(link, timer)
  }).catch(() => {})
}

function safeDecodeHash(hash: string): string {
  try {
    return decodeURIComponent(hash)
  }
  catch {
    return hash
  }
}

/**
 * @description Intercept same-page inbound anchor clicks and handle offset positions for jump links on the same page
 * @description:zh-CN 拦截点击事件，处理同一页面下跳转链接的偏移位置（按 router 实例引用计数共享监听，并返回独立的幂等清理函数）
 * @param router Vue Router
 */
export function onClickHref(router: Router): () => void {
  if (typeof window === 'undefined')
    return () => {}

  let entry = activeClickHandlers.get(router)
  if (!entry) {
    const handleClick = async (e: MouseEvent) => {
      const targetEl = e.target instanceof Element
        ? e.target
        : (e.target as Node | null)?.parentElement
      const link = targetEl?.closest('a')
      // Let controls that own their anchor navigation handle it themselves.
      if (!link || link.hasAttribute('data-valaxy-native-link'))
        return

      const { protocol, hostname, pathname, hash, target } = link
      const currentUrl = window.location
      const extMatch = pathname.match(/\.\w+$/)
      // only intercept inbound links
      if (
        !e.ctrlKey
        && !e.shiftKey
        && !e.altKey
        && !e.metaKey
        && target !== '_blank'
        && protocol === currentUrl.protocol
        && hostname === currentUrl.hostname
        && !(extMatch && extMatch[0] !== '.html')
      ) {
        if (pathname === currentUrl.pathname) {
          e.preventDefault()
          const isHeaderAnchor = link.classList.contains('header-anchor')
          if (hash && isHeaderAnchor)
            copyHeaderAnchorLink(link)

          // scroll between hash anchors in the same page
          if (hash && hash !== currentUrl.hash) {
            await router.push({ hash: safeDecodeHash(hash) })

            // use smooth scroll when clicking on header anchor links
            scrollTo(link, hash, {
              smooth: isHeaderAnchor,
            })
          }
          else if (hash && isHeaderAnchor) {
            scrollTo(link, hash, { smooth: true })
          }
        }
      }
    }

    window.addEventListener('click', handleClick, { capture: true })

    const createdEntry: ClickHandlerEntry = {
      refCount: 0,
      detach: () => {
        window.removeEventListener('click', handleClick, { capture: true })
        if (activeClickHandlers.get(router) === createdEntry)
          activeClickHandlers.delete(router)
      },
    }
    entry = createdEntry
    activeClickHandlers.set(router, entry)
  }

  const currentEntry = entry
  currentEntry.refCount += 1
  let cleaned = false

  return () => {
    if (cleaned)
      return
    cleaned = true
    currentEntry.refCount -= 1
    if (currentEntry.refCount <= 0)
      currentEntry.detach()
  }
}
