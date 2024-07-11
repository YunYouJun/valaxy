import type { Router } from 'vue-router'

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

/**
 * For theme developers, you can use this function to scroll to the target element.
 * For example, when you click the anchor link in the markdown file, it will scroll to the target element.
 * @param el
 * @param hash
 * @param options
 */
export function scrollTo(el: HTMLElement, hash: string, options: Partial<ScrollToOptions> = {
  smooth: true,
  targetPadding: -64,
}) {
  let target: Element | null = null
  try {
    target = el.classList.contains('header-anchor')
      ? el
      : ((decodeURIComponent(hash) && document.querySelector(decodeURIComponent(hash))) || null)
  }
  catch (e) {
    console.warn(e)
  }

  if (target) {
    const targetPadding = options?.targetPadding || -64
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

/**
 * @description Intercept click events and handle offset positions for jump links on the same page
 * @description:zh-CN 拦截点击事件，处理同一页面下跳转链接的偏移位置
 * @param router Vue Router
 */
export function onClickHref(router: Router) {
  // to extract
  // click title scroll
  window.addEventListener(
    'click',
    async (e) => {
      const link = (e.target as Element).closest('a')
      if (link) {
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
            // scroll between hash anchors in the same page
            if (hash && hash !== currentUrl.hash) {
              await router.push({ hash: decodeURIComponent(hash) })

              // use smooth scroll when clicking on header anchor links
              scrollTo(link, hash, {
                smooth: link.classList.contains('header-anchor'),
              })
            }
          }
        }
      }
    },
    { capture: true },
  )
}
