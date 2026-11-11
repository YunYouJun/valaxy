import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

export const useRouterStore = defineStore('routerStore', () => {
  const router = useRouter()
  // Vue Router's matcher is not reactive. Publish a new snapshot only after
  // the complete, layout-resolved route table has been replaced by HMR.
  const routeRecords = shallowRef(router.getRoutes())

  function refreshRoutes() {
    routeRecords.value = router.getRoutes()
  }

  return {
    router,
    // A getter keeps runtime components/route records out of serialized Pinia
    // state; each SSR app and hydration pass reads its own router instead.
    routes: computed(() => routeRecords.value),
    refreshRoutes,
  }
})
