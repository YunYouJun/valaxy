import { useData } from 'valaxy'
import { computed } from 'vue'
import { useThemeConfig } from '.'

export function useEditLink() {
  const themeConfig = useThemeConfig()

  return computed(() => {
    const { text, pattern } = themeConfig.value.editLink || {}
    const { relativePath } = useData()
    const url = pattern.replace(/:path/g, relativePath)

    return { url, text }
  })
}
