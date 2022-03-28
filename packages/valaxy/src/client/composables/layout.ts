import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useLayout(layout: string) {
  const route = useRoute()
  return computed(() => route.meta.layout === layout)
}
