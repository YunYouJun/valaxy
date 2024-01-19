import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { usePostList } from '..'
import type { PageDataPayload } from '../../types'

/**
 * cache site global store
 * - post
 * - tag
 * - category
 */
export const useSiteStore = defineStore('site', () => {
  const reload = ref(1)
  // for dev hot reload
  const postList = computed(() => {
    if (reload.value)
      return usePostList().value
    else
      return usePostList().value
  })

  // const postList = usePostList()

  const router = useRouter()
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

  return {
    postList,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSiteStore, import.meta.hot))
