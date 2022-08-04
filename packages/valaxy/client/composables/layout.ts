import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useLayout(layout?: string) {
  const route = useRoute()
  if (layout)
    return computed(() => route.meta.layout === layout)
  else
    return computed(() => route.meta.layout)
}
