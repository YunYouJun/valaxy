import { definePerson, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'
import { useSeoMeta } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useFrontmatter, useLocale, useValaxyHead, useValaxyI18n } from '../../composables'
import { useTimezone } from '../../composables/global'
import { useSiteConfig } from '../../config'
import { resolveSiteUrl } from '../../utils'
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg

export function useValaxyApp() {
  const siteConfig = useSiteConfig()
  const fm = useFrontmatter()

  const { locale } = useI18n()
  const { $t, $tO } = useValaxyI18n()

  const title = computed(() => $tO(fm.value.title))

  const route = useRoute()
  const { toggleLocale } = useLocale()
  // if lang exist, toggle the locale
  if (route.query.lang) {
    toggleLocale(route.query.lang as string)
  }

  // seo
  const siteUrl = computed(() => resolveSiteUrl(
    siteConfig.value.url,
    fm.value.url || route.path,
  ))
  const description = computed(() => $tO(fm.value.excerpt) || $tO(fm.value.description) || $t(siteConfig.value.description))
  const ogImage = computed(() => resolveSiteUrl(
    siteConfig.value.url,
    fm.value.ogImage || fm.value.cover || fm.value.firstImage || siteConfig.value.favicon,
  ))
  const seoTitle = computed(() => $tO(fm.value.title) || $t(siteConfig.value.title))

  useSeoMeta({
    description,
    ogDescription: description,
    ogLocale: computed(() => locale.value || fm.value.lang || siteConfig.value.lang || 'en'),
    ogLocaleAlternate: computed(() => siteConfig.value.languages.filter(l => l !== locale.value)),
    ogSiteName: computed(() => $t(siteConfig.value.title)),
    ogTitle: seoTitle,
    ogImage,
    ogImageAlt: seoTitle,
    ogType: 'website',
    ogUrl: siteUrl,
    twitterCard: 'summary_large_image',
    twitterDescription: description,
    twitterImage: ogImage,
    twitterTitle: seoTitle,
  })

  // for SEO
  useSchemaOrg([
    // https://unhead.unjs.io/docs/schema-org/guides/recipes/identity
    // Personal Website or Blog
    definePerson({
      name: $t(siteConfig.value.author.name),
      url: siteConfig.value.url,
      image: $t(siteConfig.value.author.avatar),
      sameAs: siteConfig.value.social.map(s => s.link),
    }),
    defineWebSite({
      name: title.value,
      datePublished: computed(() => fm.value.date),
      dateModified: computed(() => fm.value.updated),
    }),
    defineWebPage(),
  ])

  useTimezone()
  useValaxyHead()
}
