import type { MomentRouteInput } from '../types'
import { useRouterStore, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { normalizeMomentRoutes } from './data'

export function useMoments() {
  const router = useRouterStore().router
  const siteConfig = useSiteConfig()

  return computed(() => normalizeMomentRoutes(
    router.getRoutes() as unknown as MomentRouteInput[],
    {
      isDev: import.meta.env.DEV,
      timezone: siteConfig.value.timezone,
    },
  ))
}
