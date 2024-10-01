import { acceptHMRUpdate, defineStore } from 'pinia'
import { useToggle } from '@vueuse/core'

export const useYunAppStore = defineStore('yun-app', () => {
  const [isLeftSidebarOpen, toggleLeftSidebar] = useToggle()

  return {
    leftSidebar: {
      isOpen: isLeftSidebarOpen,
      toggle: toggleLeftSidebar,
    },
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useYunAppStore, import.meta.hot))
