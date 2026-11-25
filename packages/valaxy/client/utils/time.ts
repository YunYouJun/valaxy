import type { Post } from '../../types'
// dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { ref } from 'vue'
import { getTzOffsetMs, resolveWallTimeMs, toTimestamp } from '../../shared/utils/date'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

function createFixedOffsetDayjs(ms: number, offsetMinutes: number, targetTz?: string) {
  return dayjs(new Date(ms + offsetMinutes * 60_000), {
    $offset: offsetMinutes,
    x: { $fixedOffset: true, ...(targetTz ? { $timezone: targetTz } : {}) },
  } as any)
}

/**
 * Keep `$d` equal to the shifted UTC wall clock (`ms + offsetMs`) so cloning,
 * arithmetic, and formatting stay independent of host/visitor DST transitions.
 */
dayjs.extend((_opt, DayjsClass) => {
  const proto = DayjsClass.prototype as any
  const origParse = proto.parse
  const origInit = proto.init
  const origValueOf = proto.valueOf
  const origAdd = proto.add
  const origStartOf = proto.startOf
  const origSet = proto.$set
  const origUtcOffset = proto.utcOffset

  proto.parse = function (cfg: any) {
    const extra = cfg?.x
    if (extra?.$fixedOffset) {
      this.$x = { ...extra }
      cfg = { ...cfg, utc: false }
    }
    return origParse.call(this, cfg)
  }

  proto.init = function () {
    if (this.$x?.$fixedOffset) {
      const dt: Date = this.$d
      this.$y = dt.getUTCFullYear()
      this.$M = dt.getUTCMonth()
      this.$D = dt.getUTCDate()
      this.$W = dt.getUTCDay()
      this.$H = dt.getUTCHours()
      this.$m = dt.getUTCMinutes()
      this.$s = dt.getUTCSeconds()
      this.$ms = dt.getUTCMilliseconds()
      return
    }
    origInit.call(this)
  }

  proto.valueOf = function () {
    if (this.$x?.$fixedOffset)
      return this.$d.valueOf() - (this.$offset || 0) * 60_000
    return origValueOf.call(this)
  }

  proto.$set = function (units: any, int: number) {
    if (this.$x?.$fixedOffset) {
      this.$u = true
      try {
        return origSet.call(this, units, int)
      }
      finally {
        this.$u = false
      }
    }
    return origSet.call(this, units, int)
  }

  proto.startOf = function (units: any, isStartOf: boolean) {
    if (this.$x?.$fixedOffset) {
      const wall = (dayjs.utc(this.$d) as any).startOf(units, isStartOf)
      const targetTz: string | undefined = this.$x.$timezone
      if (targetTz)
        return createZonedDayjs(resolveWallTimeMs(wall.valueOf(), targetTz), targetTz)
      const offsetMinutes: number = this.$offset || 0
      return createFixedOffsetDayjs(wall.valueOf() - offsetMinutes * 60_000, offsetMinutes)
    }
    return origStartOf.call(this, units, isStartOf)
  }

  proto.add = function (num: number, units: any) {
    if (this.$x?.$fixedOffset) {
      this.$u = true
      try {
        return origAdd.call(this, num, units)
      }
      finally {
        this.$u = false
      }
    }
    return origAdd.call(this, num, units)
  }

  proto.utcOffset = function (input?: any, keepLocalTime?: boolean) {
    if (input !== undefined && this.$x?.$fixedOffset) {
      const base = dayjs.utc(this.valueOf())
      return origUtcOffset.call(base, input, keepLocalTime)
    }
    return origUtcOffset.call(this, input, keepLocalTime)
  }
})

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

  return createFixedOffsetDayjs(ms, offsetMinutes, targetTz)
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
