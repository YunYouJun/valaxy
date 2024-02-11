import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useRouterStore = defineStore('routerStore', () => {
  const router = useRouter()

  return {
    router,
  }
})
