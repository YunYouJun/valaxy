import { acceptHMRUpdate, defineStore } from 'pinia'

export const useYunAppStore = defineStore('yun-app', () => {
  // global cache for yun

  return {}
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useYunAppStore, import.meta.hot))
