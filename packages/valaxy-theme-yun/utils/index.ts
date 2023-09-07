export const anonymousImage = 'https://cdn.yunyoujun.cn/img/avatar/none.jpg'

/**
 * set default img
 * @param e
 */
export function onImgError(e: Event, defaultImg = anonymousImage) {
  const targetEl = e.target as HTMLImageElement
  targetEl.setAttribute('data-src', targetEl.src)
  targetEl.src = defaultImg
}

export function scrollTo(el: HTMLElement, hash: string, smooth = false) {
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
        // left: 0,
        top: targetTop,
        behavior: 'smooth',
      })
    }
  }
}
