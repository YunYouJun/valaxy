import { isClient } from '@vueuse/core'

export async function goDown() {
  if (!isClient)
    return

  const banner = document.getElementById('yun-banner')
  if (banner) {
    const { gsap } = await import('./scroll')
    // nav menu height
    const offset = 50

    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: banner.clientHeight - offset,
      },
      ease: 'power3.inOut',
    })
  }
}

/**
 * back to top
 */
export async function backToTop() {
  if (!isClient)
    return

  const { gsap } = await import('./scroll')
  gsap.to(window, {
    duration: 1,
    scrollTo: {
      y: 0,
    },
    ease: 'power3.inOut',
  })
}
