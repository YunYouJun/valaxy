import { useDark, usePreferredDark, useToggle } from '@vueuse/core'
// these APIs are auto-imported from @vueuse/core
export const isDark = useDark()
export const toggleDark = useToggle(isDark)
export const preferredDark = usePreferredDark()
