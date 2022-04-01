import dayjs from 'dayjs'
import type { Post } from '../../types'

/**
 * use dayjs format date
 * @param date
 * @param template
 * @returns
 */
export function formatDate(date: string | number | Date, template = 'YYYY-MM-DD') {
  const today = dayjs(date)
  return today.format(template)
}

/**
 * sort posts by date
 * @param posts
 * @param desc
 */
export function sortByDate(posts: Post[], desc = true) {
  return posts.sort((a, b) => {
    const aDate = +new Date(a.date || '')
    const bDate = +new Date(b.date || '')
    if (desc)
      return bDate - aDate
    else
      return aDate - bDate
  })
}
