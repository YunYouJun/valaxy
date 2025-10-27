import type { Post } from '../../types'
// dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

// https://day.js.org/docs/en/timezone/set-default-timezone
export { dayjs }

/**
 * format the date (dayjs)
 * with default timezone
 */
export function formatDate(date?: string | number | Date, options: {
  template?: string
  timezone?: string
  // keepLocalTime?: boolean
} = {}) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return dayjs.tz(dayjs.utc(date), options.timezone).format(options.template || 'YYYY-MM-DD')
}

/**
 * sort posts by date
 * @param posts
 * @param desc
 */
export function sortByDate(posts: Post[], desc = true) {
  return posts.sort((a, b) => {
    const aDate = +new Date(a.updated || a.date || '')
    const bDate = +new Date(b.updated || b.date || '')
    if (desc)
      return bDate - aDate
    else
      return aDate - bDate
  })
}
