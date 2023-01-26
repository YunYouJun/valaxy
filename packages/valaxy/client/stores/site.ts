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
  const postList = computed(() => {
    if (reload.value)
      return usePostList().value
    else
      return usePostList().value
  })

  const router = useRouter()
  router.isReady().then(() => {
    // hot reload when save md
    if (import.meta.hot) {
      import.meta.hot!.on('valaxy:pageData', (payload: PageDataPayload) => {
        // hot reload for global categories & tags
        let path = payload.path
        if (payload.path.endsWith('.md'))
          path = payload.path.slice(0, -3)

        const routeName = path.split('/').slice(1).join('-')

        if (!router.hasRoute(routeName))
          return

        const route = router.getRoutes().find(r => r.name === routeName)!
        router.removeRoute(routeName)
        route.meta.frontmatter = payload.pageData.frontmatter
        router.addRoute(route)

        // trigger computed reload
        reload.value += 1
      })
    }
  })

  return {
    postList,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSiteStore, import.meta.hot))
