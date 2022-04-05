import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { isClient } from '@vueuse/core'

import type { Post } from '../../types'
import { useConfig } from '../config'

export function useFrontmatter() {
  const route = useRoute()
  const frontmatter = computed<Post>(() => route.meta.frontmatter)

  return frontmatter
}

/**
 * get full url
 */
export function useFullUrl() {
  const config = useConfig()
  const route = useRoute()
  const url = computed(() => {
    const origin = config.value.url || (isClient && window.location.origin)
    return origin + route.path
  })
  return url
}
