import { acceptHMRUpdate, defineStore } from 'pinia'
import { useToggle } from '@vueuse/core'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const showLoading = ref(true)

  const [isSidebarOpen, toggleSidebar] = useToggle(false)
  // right sidebar with toc
  const [isRightSidebarOpen, toggleRightSidebar] = useToggle(false)

  return {
    showLoading,

    isSidebarOpen,
    toggleSidebar,

    isRightSidebarOpen,
    toggleRightSidebar,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
