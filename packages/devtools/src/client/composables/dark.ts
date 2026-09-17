import { useDark, usePreferredDark, useToggle } from '@vueuse/core'

// Shared by the Hub shell and same-origin plugin SPAs (including storage events).
export const isDark = useDark({ storageKey: 'devframes-color-scheme' })
export const toggleDark = useToggle(isDark)
export const preferredDark = usePreferredDark()
