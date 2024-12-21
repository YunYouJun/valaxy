import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Global store for users
 * @example
 * ```ts
 * import { useAppStore } from 'valaxy'
 * const appStore = useAppStore()
 * ```
 */
export const useAppStore = defineStore('app', () => {
  async function getDir() {
    const dirHandle = await window.showDirectoryPicker()
    return dirHandle
  }

  const isDevtoolsVisible = ref(false)

  // a
  return {
    getDir,

    isDevtoolsVisible,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
