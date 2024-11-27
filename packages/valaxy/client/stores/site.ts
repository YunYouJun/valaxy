import type { PageDataPayload } from '../../types'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { usePostList, useRouterStore } from '..'
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

  const reload = ref(1)
  // for dev hot reload
  const postList = computed(() => {
    const val = usePostList().value
    if (reload.value && val)
      return val
    else
      return val
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
