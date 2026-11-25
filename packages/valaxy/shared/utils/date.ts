export const NAIVE_DATE_TIME_RE = /^(\d{4})([-/])(\d{1,2})\2(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/i

const MAX_TIMESTAMP_CACHE_SIZE = 4096
const tzFormatterCache = new Map<string, Intl.DateTimeFormat>()
const naiveTimestampCache = new Map<string, number>()

function matchNaiveLocalDate(date: string) {
  const match = NAIVE_DATE_TIME_RE.exec(date)
  // Keep ISO hyphenated date-only strings (`YYYY-MM-DD`) on native Date UTC-midnight semantics.
  return match && (match[2] === '/' || match[5] !== undefined) ? match : null
}

function getTzFormatter(timezone: string) {
  let formatter = tzFormatterCache.get(timezone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      era: 'short',
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    tzFormatterCache.set(timezone, formatter)
  }
  return formatter
}

/** Return `localWallTimeAsUtcMs - utcMs` for `utcMs` in `timezone`. */
function getTzOffsetMs(utcMs: number, timezone: string): number {
  const secMs = Math.floor(utcMs / 1000) * 1000
  const parts = getTzFormatter(timezone).formatToParts(secMs)
  let era = 'AD'
  let year = 0
  let month = 0
  let day = 0
  let hour = 0
  let minute = 0
  let second = 0
  for (const part of parts) {
    if (part.type === 'era')
      era = part.value
    else if (part.type === 'year')
      year = Number(part.value)
    else if (part.type === 'month')
      month = Number(part.value)
    else if (part.type === 'day')
      day = Number(part.value)
    else if (part.type === 'hour')
      hour = Number(part.value)
    else if (part.type === 'minute')
      minute = Number(part.value)
    else if (part.type === 'second')
      second = Number(part.value)
  }
  const isoYear = era === 'BC' || era === 'B' ? 1 - year : year
  const localAsUtc = new Date(0)
  localAsUtc.setUTCFullYear(isoYear, month - 1, day)
  localAsUtc.setUTCHours(hour, minute, second, 0)
  return localAsUtc.getTime() - secMs
}

/**
 * Resolve UTC-wall-clock timestamp `utcGuessMs` inside `timezone`.
 * Ambiguous fall-back times resolve to the earlier occurrence regardless of
 * host timezone or season, and spring-forward gaps shift forward cleanly.
 */
function resolveWallTimeMs(utcGuessMs: number, timezone: string): number {
  const baseOffset = getTzOffsetMs(utcGuessMs, timezone)
  const t0 = utcGuessMs - baseOffset
  const offBefore = getTzOffsetMs(t0 - 36 * 3600_000, timezone)
  const offAfter = getTzOffsetMs(t0 + 36 * 3600_000, timezone)
  if (offBefore === offAfter)
    return utcGuessMs - offBefore

  // Prefer earlier instant on fall-back repeated hours regardless of host/build season
  const tEarlier = utcGuessMs - offBefore
  if (getTzOffsetMs(tEarlier, timezone) === offBefore)
    return tEarlier

  const tLater = utcGuessMs - offAfter
  if (getTzOffsetMs(tLater, timezone) === offAfter)
    return tLater

  return tEarlier
}

/**
 * Parse a naive date-time string (`YYYY-MM-DD HH:mm[:ss[.sss]]`, `T`, or
 * `YYYY/M/D[ H:mm[:ss[.sss]]]`) in the given IANA timezone without consulting
 * the host timezone or current wall-clock season.
 */
export function parseNaiveDateTimeMs(date: string, timezone?: string): number {
  const match = NAIVE_DATE_TIME_RE.exec(date)
  if (!match)
    return Number.NaN

  const cacheKey = timezone ? `${timezone}\0${date}` : ''
  if (cacheKey && naiveTimestampCache.has(cacheKey))
    return naiveTimestampCache.get(cacheKey)!

  const year = Number(match[1])
  const month = Number(match[3])
  const day = Number(match[4])
  const hour = Number(match[5] || 0)
  const minute = Number(match[6] || 0)
  const second = Number(match[7] || 0)
  const ms = Number((match[8] || '').padEnd(3, '0').slice(0, 3))
  const isEndOfDay = hour === 24 && minute === 0 && second === 0 && ms === 0

  const utcGuess = new Date(0)
  utcGuess.setUTCFullYear(year, month - 1, day)
  utcGuess.setUTCHours(isEndOfDay ? 0 : hour, minute, second, ms)
  if (
    utcGuess.getUTCFullYear() !== year
    || utcGuess.getUTCMonth() !== month - 1
    || utcGuess.getUTCDate() !== day
    || (!isEndOfDay && utcGuess.getUTCHours() !== hour)
    || utcGuess.getUTCMinutes() !== minute
    || utcGuess.getUTCSeconds() !== second
  ) {
    return Number.NaN
  }

  if (!timezone) {
    const localDate = new Date(0)
    localDate.setFullYear(year, month - 1, isEndOfDay ? day + 1 : day)
    localDate.setHours(isEndOfDay ? 0 : hour, minute, second, ms)
    return localDate.getTime()
  }

  const utcGuessMs = isEndOfDay ? utcGuess.getTime() + 86_400_000 : utcGuess.getTime()
  const resolved = resolveWallTimeMs(utcGuessMs, timezone)
  if (naiveTimestampCache.size >= MAX_TIMESTAMP_CACHE_SIZE)
    naiveTimestampCache.delete(naiveTimestampCache.keys().next().value!)
  naiveTimestampCache.set(cacheKey, resolved)
  return resolved
}

/**
 * Convert a post date value to epoch milliseconds, interpreting offset-free
 * date-time strings in `timezone` when specified.
 */
export function toTimestamp(date?: string | number | Date, timezone?: string): number {
  if (typeof date === 'string') {
    const trimmed = date.trim()
    if (!trimmed)
      return Number.NaN
    if (matchNaiveLocalDate(trimmed))
      return parseNaiveDateTimeMs(trimmed, timezone)
    return +new Date(trimmed)
  }
  return date === undefined ? Number.NaN : +new Date(date)
}
