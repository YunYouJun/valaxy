import type { FormatOptionsWithTZ } from 'date-fns-tz'
import { format, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { useSiteConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'
import type { Post } from '../../types'

const referenceDate = new Date(1986, 3 /* Apr */, 4, 10, 32, 0, 900)

/**
 * format the date
 * @param date the original date
 * @param formatStr the string of tokens
 * @param timezone the time zone of this local time, can be an offset or IANA time zone
 * @param options the object with options. See [Options]{@link https://date-fns.org/docs/Options}
 */
export function formatDate(date: string | number | Date, formatStr = 'yyyy-MM-dd', timezone?: string, options?: FormatOptionsWithTZ) {
  const { locale } = useI18n()
  const siteConfig = useSiteConfig()

  const mergedOptions: FormatOptionsWithTZ = Object.assign({
    originalDate: referenceDate,
    locale: { code: locale.value },
  }, options)
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  try {
    /**
     * Format the timezone-less date to ISO. If none is specified, use the client's timezone.
     * If the input date is already in ISO format, the timezone won't be applied.
     */
    date = fromZonedTime(date, timezone || siteConfig.value.timezone || clientTimezone).toISOString()
    // Convert to the client's timezone unless the user specifies otherwise
    date = toZonedTime(date, options?.timeZone || clientTimezone, mergedOptions)
    // The format function will never change the underlying date
    return format(date, formatStr, { timeZone: options?.timeZone })
  }
  catch (error) {
    console.error('Error formatting date:', date, error)
    return format(referenceDate, formatStr)
  }
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
