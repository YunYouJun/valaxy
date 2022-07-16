export const anonymousImage = 'https://cdn.yunyoujun.cn/img/avatar/none.jpg'

export const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = anonymousImage
}
