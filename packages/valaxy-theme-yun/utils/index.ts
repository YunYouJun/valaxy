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
