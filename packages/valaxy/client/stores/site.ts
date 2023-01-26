import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { usePostList } from '..'

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

  // hot reload when save md
  import.meta.hot!.on('valaxy:pageData', () => {
    reload.value += 1
  })

  return {
    postList,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSiteStore, import.meta.hot))
