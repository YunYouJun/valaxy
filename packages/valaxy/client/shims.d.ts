import type { ComputedRef } from 'vue'

declare module 'virtual:valaxy-theme' {
  /**
   * You can use `useValaxyDark`
   */
  export const isDark: ComputedRef<boolean>
}
