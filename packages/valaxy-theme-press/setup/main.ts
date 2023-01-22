import { defineAppSetup } from 'valaxy'
import { nextTick } from 'vue'

export default defineAppSetup((ctx) => {
  const { router, isClient } = ctx
  if (!isClient)
    return

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
              await router.push({ hash })
              history.replaceState({ ...history.state }, '')

              // still emit the event so we can listen to it in themes
              window.dispatchEvent(new Event('hashchange'))
              // use smooth scroll when clicking on header anchor links
              scrollTo(link, hash, link.classList.contains('header-anchor'))
            }
          }
        }
      }
    },
    { capture: true },
  )

  window.addEventListener('hashchange', (e) => {
    e.preventDefault()
  })

  router.beforeEach((to, from) => {
    if (to.path !== from.path)
      return

    nextTick(() => {
      scrollTo(document.body, to.hash, true)
    })
  })
})

function scrollTo(el: HTMLElement, hash: string, smooth = false) {
  let target: Element | null = null
  try {
    target = el.classList.contains('header-anchor')
      ? el
      : (decodeURIComponent(hash) && document.querySelector(decodeURIComponent(hash))) || null
  }
  catch (e) {
    console.warn(e)
  }

  if (target) {
    const targetPadding = -64
    const targetTop
      = window.scrollY
      + (target as HTMLElement).getBoundingClientRect().top
      + targetPadding

    // only smooth scroll if distance is smaller than screen height.
    if (!smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight) {
      window.scrollTo(0, targetTop)
    }
    else {
      window.scrollTo({
        left: 0,
        top: targetTop,
        behavior: 'smooth',
      })
    }
  }
}
