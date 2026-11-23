import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isGeneratedPaginationPath, openGraphType, pickPageShareImage } from '../../../shared/seo'
import { useSiteConfig } from '../../config'
import { resolveSiteUrl } from '../../utils/path'
import { resolveCanonicalPath, resolveShareImage } from '../../utils/seo'
import { useFrontmatter } from '../common'
import { useValaxyI18n } from '../locale'

function asText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

/**
 * Description, canonical URL, share image, and Open Graph type for the current page.
 * A page without frontmatter `description` uses the plain-text excerpt prepared at build time.
 */
export function usePageSeo() {
  const fm = useFrontmatter()
  const route = useRoute()
  const siteConfig = useSiteConfig()
  const { $t, $tO } = useValaxyI18n()

  const description = computed(() => {
    return asText($tO(fm.value.description))
      || asText(route.meta.seoDescription)
      || asText($t(siteConfig.value.description))
  })

  const routePath = computed(() => resolveCanonicalPath(route))
  const pagePath = computed(() => {
    const explicitCanonical = asText(fm.value.canonical)
    if (explicitCanonical)
      return explicitCanonical
    // `/page/1` is the same document as the homepage.
    const normalized = route.path.length > 1 ? route.path.replace(/\/+$/, '') : route.path
    if (siteConfig.value.seo?.pagination !== 'index' && normalized === '/page/1')
      return '/'
    return routePath.value
  })
  const pageUrl = computed(() => resolveSiteUrl(siteConfig.value.url, pagePath.value))
  const image = computed(() => {
    const src = pickPageShareImage(fm.value) || asText(siteConfig.value.seo?.ogImage)
    return src ? resolveShareImage(siteConfig.value.url, routePath.value, src) : undefined
  })
  const noindex = computed(() => {
    if (siteConfig.value.seo?.pagination === 'index')
      return false
    return isGeneratedPaginationPath(route.path)
  })
  const type = computed(() => openGraphType(route.path, route.meta.layout))

  return { description, pageUrl, image, type, noindex }
}
