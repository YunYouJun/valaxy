import { acceptHMRUpdate, defineStore } from 'pinia'
import { isClient, useScroll, useToggle } from '@vueuse/core'
import { useScreenSize } from 'valaxy'

export const useYunAppStore = defineStore('yun-app', () => {
  // 左侧边栏
  const [isLeftSidebarOpen, toggleLeftSidebar] = useToggle()
  // 右侧边栏
  const [isRightSidebarOpen, toggleRightSidebar] = useToggle()
  // 全屏菜单
  const [isFullscreenMenuOpen, toggleFullscreenMenu] = useToggle()

  // init once
  const size = useScreenSize()

  return {
    size,
    leftSidebar: {
      isOpen: isLeftSidebarOpen,
      toggle: toggleLeftSidebar,
    },
    rightSidebar: {
      isOpen: isRightSidebarOpen,
      toggle: toggleRightSidebar,
    },
    fullscreenMenu: {
      isOpen: isFullscreenMenuOpen,
      toggle: toggleFullscreenMenu,
    },
    scrollY: isClient ? useScroll(window).y : 0,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useYunAppStore, import.meta.hot))
