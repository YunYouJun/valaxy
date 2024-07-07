import { acceptHMRUpdate, defineStore } from 'pinia'
import { useToggle } from '@vueuse/core'
import { ref } from 'vue'
import { useThemeConfig, useValaxyDark } from 'valaxy'

/**
 * Global store for users
 * @example
 * ```ts
 * import { useAppStore } from 'valaxy'
 * const appStore = useAppStore()
 * ```
 */
export const useAppStore = defineStore('app', () => {
  const themeConfig = useThemeConfig()
  const { isDark, toggleDark, toggleDarkWithTransition, themeColor } = useValaxyDark(themeConfig.value.valaxyDarkOptions)

  const showLoading = ref(true)

  const [isSidebarOpen, toggleSidebar] = useToggle(false)
  // right sidebar with toc
  const [isRightSidebarOpen, toggleRightSidebar] = useToggle(false)

  return {
    // for dark
    isDark,
    themeColor,
    toggleDark,
    toggleDarkWithTransition,

    showLoading,

    isSidebarOpen,
    toggleSidebar,

    isRightSidebarOpen,
    toggleRightSidebar,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
