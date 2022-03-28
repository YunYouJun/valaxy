import { acceptHMRUpdate, defineStore } from 'pinia'
import { useToggle } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  const [isSidebarOpen, toggleSidebar] = useToggle(false)

  return {
    isSidebarOpen,
    toggleSidebar,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
