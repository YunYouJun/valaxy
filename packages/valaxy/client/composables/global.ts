import { useSiteConfig } from 'valaxy'
import { onBeforeMount } from 'vue'
import { dayjs } from '../utils/time'

/**
 * use timezone
 * register global timezone for formatDate
 */
export function useTimezone() {
  const siteConfig = useSiteConfig()

  onBeforeMount(() => {
    if (siteConfig.value.timezone)
      dayjs.tz.setDefault(siteConfig.value.timezone)
  })
}
