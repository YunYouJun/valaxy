import noneImg from '../assets/images/none.jpg'

/**
 * set default img
 * @param e
 */
export function onImgError(e: Event, defaultImg = noneImg) {
  const targetEl = e.target as HTMLImageElement
  targetEl.setAttribute('data-src', targetEl.src)
  targetEl.src = defaultImg
}
