import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import type { Post } from '../../types'

dayjs.extend(timezone)

/**
 * use dayjs format date
 * @param date
 * @param template
 */
export function formatDate(date: string | number | Date, template = 'YYYY-MM-DD') {
  const today = dayjs.tz(date)
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
