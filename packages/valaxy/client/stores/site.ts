import type { PageDataPayload } from '../../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { filterAndSortPosts, usePageList, useRouterStore, useSiteConfig } from '..'
import { setWindowValaxyProp } from '../utils/dev'

/**
 * cache site global store
 * - post
 * - tag
 * - category
 */
export const useSiteStore = defineStore('site', () => {
  const routerStore = useRouterStore()
  const router = routerStore.router

  // Get siteConfig once during store initialization to avoid inject() issues during HMR
  const siteConfig = useSiteConfig()
  const pageList = usePageList()

  const reload = ref(1)
  // for dev hot reload
  const postList = computed(() => {
    // Touch reload.value to trigger reactivity on HMR
    // eslint-disable-next-line ts/no-unused-expressions
    reload.value

    // Reuse the same filter and sort logic as usePostList
    return filterAndSortPosts(pageList.value, siteConfig.value)
  })

  // const postList = usePostList()

  if (router) {
    router.isReady().then(() => {
      // hot reload when save md
      if (import.meta.hot) {
        import.meta.hot!.on('valaxy:pageData', (payload: PageDataPayload) => {
          // hot reload for global categories & tags
          let path = payload.path
          if (payload.path.endsWith('.md'))
            path = payload.path.slice(0, -3)

          const routeName = path
          if (!router.hasRoute(routeName))
            return

          // can not use generatedRoutes, otherwise will trigger ValaxyMain refresh
          const route = router.getRoutes().find(r => r.name === routeName)!
          router.removeRoute(routeName)
          if (route.meta) {
            route.meta.frontmatter = {
              ...route.meta.frontmatter,
              ...payload.pageData.frontmatter,
            }
          }
          router.addRoute(route)

          // trigger `computed` reload, not server
          reload.value += 1
        })
      }
    })
  }

  if (import.meta.env.DEV)
    setWindowValaxyProp('postList', postList)

  return {
    postList,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSiteStore, import.meta.hot))
