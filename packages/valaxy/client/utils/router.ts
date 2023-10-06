export interface ScrollToOptions {
  smooth: boolean
  targetPadding: number
}

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
