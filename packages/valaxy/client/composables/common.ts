import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { isClient } from '@vueuse/core'

import type { Post } from 'valaxy/types'
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
    const siteUrl = config.value.url.endsWith('/') ? config.value.url.slice(0, -1) : config.value.url
    const origin = siteUrl || (isClient && window.location.origin)
    return origin + route.path
  })
  return url
}
