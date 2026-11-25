import type { Post } from '../../types'
// dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { ref } from 'vue'
import { toTimestamp } from '../../shared/utils/date'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

const defaultTimezoneRef = ref<string | undefined>()
const originalSetDefault = dayjs.tz.setDefault.bind(dayjs.tz)
dayjs.tz.setDefault = (tz?: string) => {
  defaultTimezoneRef.value = tz || undefined
  return originalSetDefault(tz)
}

// https://day.js.org/docs/en/timezone/set-default-timezone
export { dayjs }

/** Convert a date using the same timezone rules as formatDate. */
export function toZonedDayjs(date?: string | number | Date, tz?: string) {
  const defaultTz = defaultTimezoneRef.value
  const targetTz = (tz || undefined) ?? defaultTz
  if (date === undefined)
    return targetTz ? dayjs.tz(Date.now(), targetTz) : dayjs()
  const ms = toTimestamp(date, defaultTz)
  if (Number.isNaN(ms))
    return dayjs(Number.NaN)
  return targetTz ? dayjs.tz(ms, targetTz) : dayjs(ms)
}

/**
 * format the date (dayjs)
 * with default timezone
 */
export function formatDate(date?: string | number | Date, options: {
  template?: string
  timezone?: string
  // keepLocalTime?: boolean
} = {}) {
  return toZonedDayjs(date, options.timezone).format(options.template || 'YYYY-MM-DD')
}

/**
 * sort posts by date
 * @param posts
 * @param desc
 * @param tz
 */
export function sortByDate(posts: Post[], desc = true, tz?: string) {
  return orderByMeta(posts, 'date', desc, tz)
}

export function sortByUpdated(posts: Post[], desc = true, tz?: string) {
  return orderByMeta(posts, 'updated', desc, tz)
}

/**
 * sort posts by date
 * @param posts
 * @param orderBy
 * @param desc
 * @param tz
 */
export function orderByMeta(posts: Post[], orderBy: 'date' | 'updated' = 'date', desc = true, tz?: string) {
  const effectiveTz = (tz || undefined) ?? defaultTimezoneRef.value
  const keyed = posts.map(post => ({
    post,
    time: toTimestamp(post[orderBy] || post.date, effectiveTz),
  }))
  keyed.sort((a, b) => {
    const diff = desc ? b.time - a.time : a.time - b.time
    // Stable sort: when dates are equal, use path as tie-breaker
    // to ensure consistent order between SSR and client hydration
    if (diff !== 0)
      return diff
    return (a.post.path || '') < (b.post.path || '') ? -1 : (a.post.path || '') > (b.post.path || '') ? 1 : 0
  })
  for (let i = 0; i < keyed.length; i++)
    posts[i] = keyed[i].post
  return posts
}
