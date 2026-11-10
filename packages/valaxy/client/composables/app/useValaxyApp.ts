import { definePerson, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'
import { useSeoMeta } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { publicAuthor } from '../../../shared/seo'
import { useFrontmatter, useLocale, useValaxyHead, useValaxyI18n } from '../../composables'
import { useTimezone } from '../../composables/global'
import { useSiteConfig } from '../../config'
import { usePageSeo } from './usePageSeo'
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg

export function useValaxyApp() {
  const siteConfig = useSiteConfig()
  const fm = useFrontmatter()

  const { locale } = useI18n()
  const { $t, $tO } = useValaxyI18n()

  const route = useRoute()
  const { toggleLocale } = useLocale()
  // if lang exist, toggle the locale
  if (route.query.lang) {
    toggleLocale(route.query.lang as string)
  }

  // seo
  const { description, pageUrl, image, type } = usePageSeo()
  const seoTitle = computed(() => $tO(fm.value.title) || $t(siteConfig.value.title))
  const author = publicAuthor(siteConfig.value.author)
  const personUrl = author.link && /^https?:\/\//.test(author.link)
    ? author.link
    : (/^https?:\/\//.test(siteConfig.value.url) ? siteConfig.value.url : undefined)

  useSeoMeta({
    description,
    ogDescription: description,
    ogLocale: computed(() => locale.value || fm.value.lang || siteConfig.value.lang || 'en'),
    ogLocaleAlternate: computed(() => siteConfig.value.languages.filter(l => l !== locale.value)),
    ogSiteName: computed(() => $t(siteConfig.value.title)),
    ogTitle: seoTitle,
    ogImage: image,
    ogImageAlt: image.value ? seoTitle : undefined,
    ogType: type,
    ogUrl: pageUrl,
    twitterCard: computed(() => image.value ? 'summary_large_image' : 'summary'),
    twitterDescription: description,
    twitterImage: image,
    twitterTitle: seoTitle,
  })

  // for SEO
  useSchemaOrg([
    // https://unhead.unjs.io/docs/schema-org/guides/recipes/identity
    // Personal Website or Blog. url is the author's link, or the site when that link is unset.
    definePerson({
      name: $t(siteConfig.value.author.name),
      ...(personUrl ? { url: personUrl } : {}),
      image: $t(siteConfig.value.author.avatar),
      sameAs: siteConfig.value.social.map(s => s.link).filter(Boolean),
    }),
    defineWebSite({
      name: $t(siteConfig.value.title),
      description: $t(siteConfig.value.description),
    }),
    defineWebPage({
      name: seoTitle,
      description,
      url: pageUrl,
      datePublished: computed(() => fm.value.date),
      dateModified: computed(() => fm.value.updated),
    }),
  ])

  useTimezone()
  useValaxyHead()
}
