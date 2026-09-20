import { useData, useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useLocaleConfig } from './locale'

export function useEditLink() {
  const { localeConfig } = useLocaleConfig()
  const { page } = useData()
  const frontmatter = useFrontmatter()

  return computed(() => {
    const { text, pattern } = localeConfig.value.editLink || {}
    const url = frontmatter.value?.editLink === false ? '' : pattern?.replace(/:path/g, page.value?.relativePath || '') || ''
    return { url, text }
  })
}
