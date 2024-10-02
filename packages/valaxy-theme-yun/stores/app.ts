import { acceptHMRUpdate, defineStore } from 'pinia'
import { useToggle } from '@vueuse/core'

export const useYunAppStore = defineStore('yun-app', () => {
  // 左侧边栏
  const [isLeftSidebarOpen, toggleLeftSidebar] = useToggle()
  // 全屏菜单
  const [isFullscreenMenuOpen, toggleFullscreenMenu] = useToggle()

  return {
    leftSidebar: {
      isOpen: isLeftSidebarOpen,
      toggle: toggleLeftSidebar,
    },
    fullscreenMenu: {
      isOpen: isFullscreenMenuOpen,
      toggle: toggleFullscreenMenu,
    },
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useYunAppStore, import.meta.hot))
