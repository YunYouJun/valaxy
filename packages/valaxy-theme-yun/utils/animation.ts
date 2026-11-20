import { isClient } from '@vueuse/core'

async function scrollTo(y: number) {
  const { gsap } = await import('./scroll')
  gsap.to(window, {
    duration: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 1,
    overwrite: 'auto',
    scrollTo: { y },
    ease: 'power3.inOut',
  })
}

export async function goDown() {
  if (!isClient)
    return

  const banner = document.getElementById('yun-banner')
  if (banner) {
    // Leave room for the fixed navigation.
    await scrollTo(banner.clientHeight - 50)
  }
}

export async function backToTop() {
  if (isClient)
    await scrollTo(0)
}
