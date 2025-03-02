import { useData } from 'valaxy'
import { computed } from 'vue'
import { useThemeConfig } from '.'

export function useEditLink() {
  const themeConfig = useThemeConfig()
  const { page } = useData()

  return computed(() => {
    const { text, pattern } = themeConfig.value.editLink || {}
    const url = pattern.replace(/:path/g, page.value.relativePath)

    return { url, text }
  })
}
