import type { Post } from '../../types'
// dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

const cnTimezone = 'Asia/Shanghai'
dayjs.tz.setDefault(cnTimezone)

/**
 * format the date (dayjs)
 */
export function formatDate(date?: string | number | Date, options: {
  template?: string
  timezone?: string
  keepLocalTime?: boolean
} = {}) {
  return dayjs(date).tz(options.timezone, options.keepLocalTime).format(options.template || 'YYYY-MM-DD')
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
