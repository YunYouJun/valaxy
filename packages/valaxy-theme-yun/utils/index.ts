import { formatDate } from 'valaxy'
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

/**
 * date-fns format date with 'yyyy-MM-dd HH:mm:ss'
 * @param date
 */
export function formatTimestamp(date: string | number | Date): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}
