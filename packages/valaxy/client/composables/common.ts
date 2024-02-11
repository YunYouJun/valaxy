import { useRoute } from 'vue-router'
import { computed, inject } from 'vue'
import { isClient } from '@vueuse/core'

import type { PageData, Post } from 'valaxy/types'
import { useSiteConfig } from '../config'

export function useFrontmatter() {
  // inject not in app root
  const route = useRoute()
  const frontmatter = computed<Post>(() => {
    return route.meta.frontmatter || {}
  })
  return frontmatter
}

/**
 * inject pageData
 */
export function useData(): PageData {
  const value = inject<PageData>('pageData', {} as any)
  return value
}

/**
 * get full url
 */
export function useFullUrl() {
  const siteConfig = useSiteConfig()
  const route = useRoute()
  const url = computed(() => {
    const siteUrl = siteConfig.value.url.endsWith('/') ? siteConfig.value.url.slice(0, -1) : siteConfig.value.url
    const origin = siteUrl || (isClient && window.location.origin)
    return origin + route.path
  })
  return url
}
