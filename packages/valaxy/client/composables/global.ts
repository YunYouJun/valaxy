import { useSiteConfig } from 'valaxy'
import { watch } from 'vue'
import { dayjs } from '../utils/time'

/**
 * use timezone
 * register global timezone for formatDate
 */
export function useTimezone() {
  const siteConfig = useSiteConfig()

  watch(
    () => siteConfig.value.timezone,
    (tz) => {
      dayjs.tz.setDefault(tz || undefined)
    },
    { immediate: true },
  )
}
