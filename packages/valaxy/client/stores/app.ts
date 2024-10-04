import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import { useMobile, useThemeConfig, useValaxyDark } from 'valaxy'

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

  const isMobile = useMobile()
  const showLoading = ref(true)

  return {
    isMobile,
    // for dark
    isDark,
    themeColor,
    toggleDark,
    toggleDarkWithTransition,

    showLoading,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
