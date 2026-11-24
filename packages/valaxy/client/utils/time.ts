import type { Post } from '../../types'
// dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { ref } from 'vue'
import { getTzOffsetMs, toTimestamp } from '../../shared/utils/date'

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

/**
 * Construct a Day.js instance locked to `targetTz` at `ms` without reparsing
 * wall-clock fields through the visitor/host local timezone (which fails when
 * the host timezone has a DST gap/transition at that wall time).
 */
function createZonedDayjs(ms: number, targetTz?: string) {
  if (Number.isNaN(ms))
    return dayjs(Number.NaN)
  if (!targetTz)
    return dayjs(ms)

  const offsetMs = getTzOffsetMs(ms, targetTz)
  const offsetMinutes = offsetMs / 60_000
  if (offsetMinutes === 0) {
    const res = dayjs.utc(ms)
    ;(res as any).$x.$timezone = targetTz
    return res
  }

  const res = dayjs.utc(ms + offsetMs).utcOffset(offsetMinutes, true)
  const resAny = res as any
  const shifted = new Date(ms + offsetMs)
  const localOffset = shifted.getTimezoneOffset()
  resAny.$d = localOffset === 0 ? shifted : new Date(ms + (offsetMinutes + localOffset) * 60_000)
  resAny.$x.$localOffset = localOffset
  resAny.$x.$timezone = targetTz
  return res
}

/** Convert a date using the same timezone rules as formatDate. */
export function toZonedDayjs(date?: string | number | Date, tz?: string) {
  const defaultTz = defaultTimezoneRef.value
  const targetTz = (tz || undefined) ?? defaultTz
  if (date === undefined)
    return createZonedDayjs(Date.now(), targetTz)
  const ms = toTimestamp(date, defaultTz)
  return createZonedDayjs(ms, targetTz)
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
