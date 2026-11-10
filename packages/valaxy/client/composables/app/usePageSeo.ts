import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { openGraphType, pickShareImage } from '../../../shared/seo'
import { useSiteConfig } from '../../config'
import { resolveSiteUrl } from '../../utils/path'
import { resolveShareImage } from '../../utils/seo'
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

  const pagePath = computed(() => fm.value.canonical || route.path)
  const pageUrl = computed(() => resolveSiteUrl(siteConfig.value.url, pagePath.value))
  const image = computed(() => {
    const src = pickShareImage([fm.value.ogImage, fm.value.cover, fm.value.firstImage])
    return src ? resolveShareImage(siteConfig.value.url, route.path, src) : undefined
  })
  const type = computed(() => openGraphType(route.path, route.meta.layout))

  return { description, pageUrl, image, type }
}
