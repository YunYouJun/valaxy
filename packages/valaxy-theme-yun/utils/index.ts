import { formatDate } from 'valaxy'
import noneImg from '../assets/images/none.jpg'

export * from './animation'
export * from './outline'
export * from './sidebar'

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
  return formatDate(date, {
    template: 'YYYY-MM-DD HH:mm:ss',
  })
}

/**
 * Normalize post categories into a slash-delimited path when non-empty.
 */
export function resolveCategoryPath(categories?: string | string[]): string {
  const path = Array.isArray(categories)
    ? categories.filter(c => c?.trim()).join('/')
    : categories
  return path?.trim() ? path : ''
}
