import { useSiteConfig } from 'valaxy'
import { onBeforeMount, ref } from 'vue'

export const timezone = ref<string>()

/**
 * use timezone
 * register global timezone for formatDate
 */
export function useTimezone() {
  const siteConfig = useSiteConfig()

  onBeforeMount(() => {
    timezone.value = siteConfig.value.timezone
  })
}
