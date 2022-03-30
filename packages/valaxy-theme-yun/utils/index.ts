import { anonymousImage } from '../config'

export const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = anonymousImage
}
