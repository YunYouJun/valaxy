import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useLayout(layout?: string) {
  const route = useRoute()
  if (layout)
    return computed(() => route.meta?.layout === layout)
  else
    return computed(() => route.meta?.layout)
}

/**
 * is mobile media query
 */
export function useMobile() {
  return useMediaQuery('(max-width: 768px)')
}
