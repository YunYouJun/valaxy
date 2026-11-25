import type { Post } from '../packages/valaxy/types'
import { afterEach, describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { dateExamples } from '../e2e/utils/date-examples'
import { dayjs, formatDate, orderByMeta, toZonedDayjs } from '../packages/valaxy/client/utils/time'
import { schemaDate } from '../packages/valaxy/shared/seo'
import { parseNaiveDateTimeMs } from '../packages/valaxy/shared/utils/date'
import 'dayjs/locale/de'

const originalTZ = process.env.TZ

afterEach(() => {
  if (originalTZ === undefined)
    delete process.env.TZ
  else
    process.env.TZ = originalTZ
  dayjs.tz.setDefault()
})

it('dayjs date', () => {
  dayjs.tz.setDefault('Europe/Berlin')
  expect(dayjs.tz('2024-01-01T00:00Z').format()).toBe('2024-01-01T00:00:00+01:00')
})

describe('dayjs date', () => {
  for (let i = 0; i < dateExamples.length; i++) {
    const example = dateExamples[i]
    it(`timezone format validation(${i}): ${example.date} ${example.expected}`, () => {
      process.env.TZ = 'Asia/Shanghai'
      dayjs.tz.setDefault('Asia/Shanghai')

      expect(formatDate(example.date, {
        template: example.template,
        timezone: example.timezone,
      })).toBe(example.expected)
    })
  }
})

describe('naive date-time across browser host timezones', () => {
  for (const hostTz of ['UTC', 'America/New_York']) {
    it(`keeps site timezone date stable when host TZ is ${hostTz}`, () => {
      process.env.TZ = hostTz
      dayjs.tz.setDefault('Asia/Shanghai')

      expect(formatDate('2022-11-09 23:59:59')).toBe('2022-11-09')
      expect(formatDate('2024-02-09 23:35:00')).toBe('2024-02-09')
      expect(formatDate('2024-02-09T09:08:00', { template: 'YYYY-MM-DD HH:mm:ss' })).toBe('2024-02-09 09:08:00')
      expect(toZonedDayjs('2022-11-09 23:59:59').valueOf()).toBe(Date.UTC(2022, 10, 9, 15, 59, 59))
      expect(formatDate('2023-07-19', { template: 'YYYY-MM-DD HH:mm:ss' })).toBe('2023-07-19 08:00:00')
      expect(formatDate('2024-01-01T00:00Z', { template: 'YYYY-MM-DD HH:mm:ss' })).toBe('2024-01-01 08:00:00')
    })
  }

  it('orders naive and offset dates consistently when host TZ differs from site timezone', () => {
    process.env.TZ = 'America/New_York'
    dayjs.tz.setDefault('Asia/Shanghai')

    const posts: Post[] = [
      { path: '/naive-earlier', date: '2024-02-09 05:00:00' },
      { path: '/offset-later', date: '2024-02-09T09:00:00+08:00' },
    ]
    const sorted = orderByMeta([...posts], 'date', true)
    expect(sorted.map(p => p.path)).toEqual(['/offset-later', '/naive-earlier'])
  })

  it('ignores visitor DST transitions and resolves fall-back hours deterministically', () => {
    for (const hostTz of ['UTC', 'Europe/Berlin']) {
      process.env.TZ = hostTz
      dayjs.tz.setDefault('America/Los_Angeles')
      expect(formatDate('2024-10-26T23:30:00', { template: 'YYYY-MM-DD HH:mm:ss' })).toBe('2024-10-26 23:30:00')
    }

    expect(parseNaiveDateTimeMs('2024-11-03T01:30:00', 'America/New_York')).toBe(Date.UTC(2024, 10, 3, 5, 30, 0))
    expect(parseNaiveDateTimeMs('2024-03-10T02:30:00', 'America/New_York')).toBe(Date.UTC(2024, 2, 10, 7, 30, 0))
  })

  it('preserves fractional-second precision in naive timestamps', () => {
    dayjs.tz.setDefault('Asia/Shanghai')
    expect(toZonedDayjs('2024-02-09 09:08:00.1').valueOf()).toBe(Date.UTC(2024, 1, 9, 1, 8, 0, 100))
    expect(toZonedDayjs('2024-02-09 09:08:00.01').valueOf()).toBe(Date.UTC(2024, 1, 9, 1, 8, 0, 10))
  })

  it('recomputes reactive date labels when default timezone changes and aligns schemaDate', () => {
    process.env.TZ = 'UTC'
    dayjs.tz.setDefault('Asia/Shanghai')

    const formatted = computed(() => formatDate('2024-02-09 05:00:00', { template: 'YYYY-MM-DD HH:mm:ss' }))
    expect(formatted.value).toBe('2024-02-09 05:00:00')
    expect(schemaDate('2024-02-09 05:00:00', 'Asia/Shanghai')).toBe('2024-02-08T21:00:00.000Z')

    dayjs.tz.setDefault('UTC')
    expect(formatted.value).toBe('2024-02-09 05:00:00')

    const shifted = computed(() => formatDate('2024-02-09T05:00:00Z', { template: 'YYYY-MM-DD HH:mm:ss' }))
    dayjs.tz.setDefault('Asia/Shanghai')
    expect(shifted.value).toBe('2024-02-09 13:00:00')
    dayjs.tz.setDefault('Europe/Berlin')
    expect(shifted.value).toBe('2024-02-09 06:00:00')
  })

  it('resolves exact instants across visitor DST gaps for sorting and schemaDate', () => {
    process.env.TZ = 'America/New_York'
    dayjs.tz.setDefault('Asia/Shanghai')
    expect(parseNaiveDateTimeMs('2024-03-10T02:30:00', 'Asia/Shanghai')).toBe(Date.UTC(2024, 2, 9, 18, 30, 0))
    expect(schemaDate('2024-03-10T02:30:00', 'Asia/Shanghai')).toBe('2024-03-09T18:30:00.000Z')

    process.env.TZ = 'Europe/London'
    expect(parseNaiveDateTimeMs('2024-03-31T02:30:00', 'Asia/Shanghai')).toBe(Date.UTC(2024, 2, 30, 18, 30, 0))
    expect(schemaDate('2024-03-31T02:30:00', 'Asia/Shanghai')).toBe('2024-03-30T18:30:00.000Z')
  })

  it('treats an empty display timezone option as unset', () => {
    dayjs.tz.setDefault()
    expect(formatDate('2024-02-09 23:35:00', { timezone: '' })).toBe('2024-02-09')
  })

  it('uses explicit timezone argument when sorting without global default', () => {
    process.env.TZ = 'America/New_York'
    dayjs.tz.setDefault()

    const posts: Post[] = [
      { path: '/naive-earlier', date: '2024-02-09 05:00:00' },
      { path: '/offset-later', date: '2024-02-09T09:00:00+08:00' },
    ]
    const sorted = orderByMeta([...posts], 'date', true, 'Asia/Shanghai')
    expect(sorted.map(p => p.path)).toEqual(['/offset-later', '/naive-earlier'])
  })

  it('preserves valid 24:00 end-of-day timestamps and rejects invalid rollovers', () => {
    dayjs.tz.setDefault('Asia/Shanghai')
    expect(formatDate('2024-03-10T24:00', { template: 'YYYY-MM-DD HH:mm:ss' })).toBe('2024-03-11 00:00:00')
    expect(schemaDate('2024-03-10T24:00', 'Asia/Shanghai')).toBe('2024-03-10T16:00:00.000Z')
    expect(parseNaiveDateTimeMs('2024-03-10T24:01', 'Asia/Shanghai')).toBeNaN()
    expect(schemaDate('2024-02-30T24:00', 'Asia/Shanghai')).toBeUndefined()
  })

  it('keeps zoned Day.js instances consistent across clone, add, and startOf across host DST', () => {
    process.env.TZ = 'America/New_York'
    dayjs.tz.setDefault('America/New_York')
    const ny = toZonedDayjs('2024-03-10T07:30:00Z')
    expect(ny.format()).toBe('2024-03-10T03:30:00-04:00')
    expect(ny.clone().format()).toBe('2024-03-10T03:30:00-04:00')
    expect(ny.add(1, 'hour').format()).toBe('2024-03-10T04:30:00-04:00')
    expect(ny.startOf('day').format()).toBe('2024-03-10T00:00:00-05:00')

    dayjs.tz.setDefault('Asia/Shanghai')
    const sh = toZonedDayjs('2024-03-10T12:30:00')
    expect(sh.clone().format()).toBe('2024-03-10T12:30:00+08:00')
    expect(sh.add(1, 'hour').format()).toBe('2024-03-10T13:30:00+08:00')
    expect(sh.clone().valueOf()).toBe(Date.UTC(2024, 2, 10, 4, 30, 0))
  })

  it('parses slash-separated naive dates in site timezone across hosts', () => {
    process.env.TZ = 'America/Los_Angeles'
    dayjs.tz.setDefault('Asia/Shanghai')

    expect(formatDate('2024/2/9 23:35')).toBe('2024-02-09')
    expect(formatDate('2021/3/1 12:00', { template: 'YYYY/MM/DD HH:mm' })).toBe('2021/03/01 12:00')

    const posts: Post[] = [
      { path: '/slash-earlier', date: '2024/2/9 23:35' },
      { path: '/offset-later', date: '2024-02-10T01:00:00+08:00' },
    ]
    const sorted = orderByMeta([...posts], 'date', true)
    expect(sorted.map(p => p.path)).toEqual(['/offset-later', '/slash-earlier'])
  })

  it('resolves long historical timezone overlaps and BCE era years deterministically', () => {
    expect(parseNaiveDateTimeMs('1969-09-30T18:00:00', 'Pacific/Kwajalein')).toBe(Date.UTC(1969, 8, 30, 7, 0, 0))
    expect(schemaDate('0000-03-02T12:00:00', 'UTC')).toBe('0000-03-02T12:00:00.000Z')
  })

  it('supports lowercase t timestamps, utcOffset keepLocalTime, and startOf locale', () => {
    process.env.TZ = 'UTC'
    dayjs.tz.setDefault('Asia/Shanghai')

    expect(formatDate('2024-02-09t23:35:00')).toBe('2024-02-09')
    const ordered = orderByMeta([
      { path: '/lower-earlier', date: '2024-02-09t05:00:00' },
      { path: '/upper-later', date: '2024-02-09T09:00:00' },
    ], 'date', true)
    expect(ordered.map(p => p.path)).toEqual(['/upper-later', '/lower-earlier'])

    const deWeekStart = toZonedDayjs('2024-02-09 20:00:00').locale('de').startOf('week')
    expect(deWeekStart.locale()).toBe('de')
    expect(deWeekStart.format('YYYY-MM-DD')).toBe('2024-02-05')
  })

  it('handles repeated date-time spaces and rejects nonzero sub-ms at 24:00', () => {
    process.env.TZ = 'UTC'
    dayjs.tz.setDefault('Asia/Shanghai')

    const ordered = orderByMeta([
      { path: '/earlier', date: '2024-02-09  23:00' },
      { path: '/later', date: '2024-02-10 01:00' },
    ], 'date', true)
    expect(ordered.map(p => p.path)).toEqual(['/later', '/earlier'])

    expect(schemaDate('2024-02-09T24:00:00.0001', 'Asia/Shanghai')).toBeUndefined()
    expect(schemaDate('2024-02-09T24:00:00.0000', 'Asia/Shanghai')).toBe('2024-02-09T16:00:00.000Z')
  })
})
