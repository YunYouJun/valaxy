import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed } from 'vue'
import { filterAndSortPosts, usePageList, useSiteConfig } from '..'
import { setWindowValaxyProp } from '../utils/dev'

/**
 * cache site global store
 * - post
 * - tag
 * - category
 */
export const useSiteStore = defineStore('site', () => {
  // Get siteConfig once during store initialization to avoid inject() issues during HMR
  const siteConfig = useSiteConfig()
  const pageList = usePageList()

  // usePageList observes the generated route metadata, including excerpts and
  // removed fields, rather than merging raw Markdown frontmatter a second time.
  const postList = computed(() => filterAndSortPosts(pageList.value, siteConfig.value))

  if (import.meta.env.DEV)
    setWindowValaxyProp('postList', postList)

  return {
    postList,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSiteStore, import.meta.hot))
