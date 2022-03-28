import { useRoute } from 'vue-router'
import type { Post } from 'valaxy'
import { computed } from 'vue'

import { isDev, useConfig } from 'valaxy'

export function useFrontmatter() {
  const route = useRoute()
  const frontmatter = computed<Post>(() => route.meta.frontmatter)

  // eslint-disable-next-line no-console
  if (isDev) console.log(frontmatter.value)
  return frontmatter
}

/**
 * get full url
 */
export function useFullUrl() {
  const config = useConfig()
  const route = useRoute()
  const url = computed(() => {
    const origin = config.value.url || window?.location.origin
    return origin + route.path
  })
  return url
}
