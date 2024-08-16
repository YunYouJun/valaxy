import type { ToDateOptionsWithTZ } from 'date-fns-tz'
import { format, toZonedTime } from 'date-fns-tz'
import { formatISO, toDate } from 'date-fns'
import { Temporal } from '@js-temporal/polyfill'
import { useSiteConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { DateTime } from 'luxon'
import type { Post } from '../../types'

const referenceDate = new Date(1986, 3 /* Apr */, 4, 10, 32, 0, 900)

/**
 * format the date
 * @param date the original date
 * @param formatStr the string of tokens
 * @param timezone the time zone of this local time, can be an offset or IANA time zone
 * @param options the object with options. See [Options]{@link https://date-fns.org/docs/Options}
 */
export function formatDate(date: string | number | Date, formatStr = 'yyyy-MM-dd', timezone?: string, options?: ToDateOptionsWithTZ): string {
  const { locale } = useI18n()
  const siteConfig = useSiteConfig()

  const mergedOptions: ToDateOptionsWithTZ = Object.assign({ locale: { code: locale.value } }, options)
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  // const clientTimezone = Temporal.Now.zonedDateTimeISO().getTimeZone().id

  try {
    /**
     * Format the timezone-less date to ISO. If none is specified, use the client's timezone.
     * If the input date is already in ISO format, the timezone won't be applied.
     */
    date = handleTimeWithZone(date, timezone || siteConfig.value.timezone || clientTimezone).toString()
    // Convert to the client's timezone unless the user specifies otherwise
    const zonedDate = toZonedTime(date, options?.timeZone || clientTimezone, mergedOptions)
    // The format function will never change the underlying date
    return format(zonedDate, formatStr, { timeZone: options?.timeZone })
  }
  catch (error) {
    console.error('Error formatting date:', date, error)
    return format(referenceDate, formatStr)
  }
}

function handleTimeWithZone(date: string | number | Date, timezone: string) {
  if (typeof date !== 'string')
    date = toDate(date).toISOString()

  let dateTime = DateTime.fromISO(date, { setZone: true })

  const toDateTime = (date: string, zone: string) => {
    // Convert date from "yyyy-MM-dd HH:mm:ss" to "yyyy-MM-dd'T'HH:mm:ss" format
    // Temporal supports a subset of ISO 8601
    const isoDate = Temporal.ZonedDateTime.from(`${date}[${zone}]`).toString()
    return DateTime.fromISO(isoDate, { zone })
  }

  if (!dateTime.isValid || !dateTime.zoneName) {
    try {
      dateTime = toDateTime(date, timezone)
    }
    catch (error) {
      // Attempt to format the date using a function that handles non-ISO 8601 formats
      const isoDate = formatISO(date)

      if (error instanceof RangeError)
        console.warn(error.message, '\nTimezone:', timezone, '\nOriginal Date Input:', date.toString(), '\nAttempting to Format Date as ISO:', isoDate)

      dateTime = toDateTime(isoDate, timezone)

      console.warn(
        'The date format provided is non-standard. The recommended format is \'yyyy-MM-dd HH:mm:ss\'',
        '\nOriginal Date:',
        date.toString(),
        '\nFormatted Date:',
        dateTime.toString(),
        '\nPlease update the date format to improve consistency and avoid potential issues',
      )
    }
  }

  return dateTime
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
