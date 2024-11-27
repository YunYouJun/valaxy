import { acceptHMRUpdate, defineStore } from 'pinia'
import { useMobile, useSiteConfig, useThemeConfig, useValaxyDark } from 'valaxy'
import { computed, ref } from 'vue'

/**
 * Global store for users
 * @example
 * ```ts
 * import { useAppStore } from 'valaxy'
 * const appStore = useAppStore()
 * ```
 */
export const useAppStore = defineStore('app', () => {
  const siteConfig = useSiteConfig()

  const themeConfig = useThemeConfig()
  const { isDark, toggleDark, toggleDarkWithTransition, themeColor } = useValaxyDark(themeConfig.value.valaxyDarkOptions)

  const isMobile = useMobile()
  const showLoading = ref(true)

  const showToggleLocale = computed(() => siteConfig.value.languages.length > 1)

  return {
    isMobile,
    // for dark
    isDark,
    /**
     * show toggle locale btn
     * only show toggle when `siteConfig.languages.length > 1`
     */
    showToggleLocale,
    themeColor,
    toggleDark,
    toggleDarkWithTransition,

    showLoading,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
