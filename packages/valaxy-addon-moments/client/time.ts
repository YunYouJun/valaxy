import type { MomentEntry } from '../types'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

const DATE_WITH_TIMEZONE_RE = /(?:Z|[+-]\d{2}:?\d{2})$/i

export function normalizeMomentTimezone(timezone?: string) {
  return timezone?.trim() || 'UTC'
}

function parseMomentDate(date: string | Date, timezone?: string) {
  const zone = normalizeMomentTimezone(timezone)
  if (date instanceof Date)
    return dayjs(date).tz(zone)

  const value = date.trim()
  const parsed = dayjs(value)
  if (!parsed.isValid())
    return parsed

  return DATE_WITH_TIMEZONE_RE.test(value)
    ? parsed.tz(zone)
    : dayjs.tz(value, zone)
}

export function getMomentTimestamp(date: string | Date, timezone?: string) {
  return parseMomentDate(date, timezone).valueOf()
}

export function isMomentDateValid(value: unknown, timezone?: string): value is string | Date {
  return (typeof value === 'string' || value instanceof Date) && parseMomentDate(value, timezone).isValid()
}

export function toMomentDateTime(date: string | Date, timezone?: string) {
  return parseMomentDate(date, timezone).toDate()
}

export function formatMomentDate(date: string | Date, timezone?: string) {
  return parseMomentDate(date, timezone).format('YYYY-MM-DD HH:mm')
}

export function getMomentPinPriority(moment: Pick<MomentEntry, 'top'>) {
  return typeof moment.top === 'number' && Number.isFinite(moment.top) && moment.top > 0
    ? moment.top
    : 0
}

export function isPinnedMoment(moment: Pick<MomentEntry, 'top'>) {
  return getMomentPinPriority(moment) > 0
}

export interface MomentMonthGroup {
  anchor: string
  label: string
  month: number
  moments: MomentEntry[]
  year: number
}

export interface MomentYearGroup {
  months: MomentMonthGroup[]
  year: number
}

export function getMomentMonth(date: string | Date, timezone?: string) {
  const value = parseMomentDate(date, timezone)
  const year = value.year()
  const month = value.month() + 1
  return {
    anchor: `moments-${year}-${String(month).padStart(2, '0')}`,
    label: String(month).padStart(2, '0'),
    month,
    year,
  }
}

export function partitionPinnedMoments(moments: MomentEntry[]) {
  const pinned: MomentEntry[] = []
  const regular: MomentEntry[] = []

  for (const moment of moments) {
    if (isPinnedMoment(moment))
      pinned.push(moment)
    else
      regular.push(moment)
  }

  return { pinned, regular }
}

export function getMomentMonthAnchorTargets(moments: MomentEntry[], timezone?: string) {
  const targets = new Map<string, string>()
  const regularMonths = new Set<string>()

  for (const moment of moments) {
    const anchor = getMomentMonth(moment.date, timezone).anchor
    const isPinned = isPinnedMoment(moment)

    if (!isPinned && !regularMonths.has(anchor)) {
      targets.set(anchor, moment.path)
      regularMonths.add(anchor)
    }
    else if (isPinned && !targets.has(anchor)) {
      targets.set(anchor, moment.path)
    }
  }

  return targets
}

export function groupMomentsByYear(moments: MomentEntry[], timezone?: string): MomentYearGroup[] {
  const years = new Map<number, Map<number, MomentMonthGroup>>()

  for (const moment of moments) {
    const period = getMomentMonth(moment.date, timezone)
    const months = years.get(period.year) ?? new Map<number, MomentMonthGroup>()
    const group = months.get(period.month) ?? { ...period, moments: [] }
    group.moments.push(moment)
    months.set(period.month, group)
    years.set(period.year, months)
  }

  return [...years.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year,
      months: [...months.values()].sort((a, b) => b.month - a.month),
    }))
}
