import { formatDate } from 'valaxy'
import noneImg from '../assets/images/none.jpg'

export * from './animation'

/**
 * set default img
 * @param e
 */
export function onImgError(e: Event, defaultImg = noneImg) {
  const targetEl = e.target as HTMLImageElement
  targetEl.setAttribute('data-src', targetEl.src)
  targetEl.src = defaultImg
}

/**
 * date-fns format date with 'YYYY-MM-DD HH:mm:ss'
 * @param date
 */
export function formatTimestamp(date: string | number | Date): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}
