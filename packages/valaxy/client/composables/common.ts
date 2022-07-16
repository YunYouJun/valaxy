import { useRoute } from 'vue-router'
import { computed, inject } from 'vue'
import { isClient } from '@vueuse/core'

import type { PageData, Post } from '../../types'
import { useSite } from '../config'

export function useFrontmatter() {
  const route = useRoute()
  const frontmatter = computed<Post>(() => route.meta.frontmatter)

  return frontmatter
}

/**
 * inject pageData
 * @returns
 */
export function useData(): PageData {
  const value = inject<PageData>('pageData', {} as any)
  return value
}

/**
 * get full url
 */
export function useFullUrl() {
  const config = useSite()
  const route = useRoute()
  const url = computed(() => {
    const siteUrl = config.value.url.endsWith('/') ? config.value.url.slice(0, -1) : config.value.url
    const origin = siteUrl || (isClient && window.location.origin)
    return origin + route.path
  })
  return url
}
