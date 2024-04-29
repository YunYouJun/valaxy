import { format } from 'date-fns'
import type { Post } from '../../types'

/**
 * date-fns format date
 * @param date
 * @param template
 */
export function formatDate(date: string | number | Date, template = 'yyyy-MM-dd') {
  return format(date, template)
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
