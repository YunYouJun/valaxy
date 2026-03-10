import { useData } from 'valaxy'
import { computed } from 'vue'
import { useLocaleConfig } from './locale'

export function useEditLink() {
  const { localeConfig } = useLocaleConfig()
  const { page } = useData()

  return computed(() => {
    const { text, pattern } = localeConfig.value.editLink || {}
    const url = pattern.replace(/:path/g, page.value?.relativePath || '')
    return { url, text }
  })
}
