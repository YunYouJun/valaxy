import { gsap } from 'gsap'
// gsap/ScrollToPlugin is ESM, but gsap not include 'type:module' in package.json
// use cjs for vite-ssg, optimizeDeps for ESM
import ScrollToPlugin from 'gsap/dist/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

export function goDown() {
  const banner = document.getElementById('yun-banner')
  if (banner) {
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
export function backToTop() {
  gsap.to(window, {
    duration: 1,
    scrollTo: {
      y: 0,
    },
    ease: 'power3.inOut',
  })
}
