import { defineArticle, defineBreadcrumb, definePerson, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'
import { useSeoMeta } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildBreadcrumbItems, publicAuthor, schemaDate, schemaNodeId } from '../../../shared/seo'
import { useFrontmatter, useLocale, useValaxyHead, useValaxyI18n } from '../../composables'
import { useTimezone } from '../../composables/global'
import { useSiteConfig } from '../../config'
import { resolveSocialSameAs } from '../../utils/seo'
import { usePageSeo } from './usePageSeo'

function asText(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

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
  const identityId = schemaNodeId(siteConfig.value.url, 'identity')
  const websiteId = schemaNodeId(siteConfig.value.url, 'website')

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

  const articleDescription = computed(() => asText($tO(fm.value.description)) || asText(route.meta.seoDescription))
  const breadcrumbs = computed(() => buildBreadcrumbItems({
    siteUrl: siteConfig.value.url,
    siteTitle: $t(siteConfig.value.title),
    pageTitle: seoTitle.value,
    path: route.path,
  }))

  // for SEO
  useSchemaOrg([
    // https://unhead.unjs.io/docs/schema-org/guides/recipes/identity
    // Personal Website or Blog. url is the author's link, or the site when that link is unset.
    definePerson({
      ...(identityId ? { '@id': identityId } : {}),
      name: $t(siteConfig.value.author.name),
      ...(author.email ? { email: author.email } : {}),
      ...(personUrl ? { url: personUrl } : {}),
      image: $t(siteConfig.value.author.avatar),
      sameAs: resolveSocialSameAs(siteConfig.value.url, siteConfig.value.social, siteConfig.value.feed?.name),
    }),
    defineWebSite({
      ...(websiteId ? { '@id': websiteId } : {}),
      name: $t(siteConfig.value.title),
      description: $t(siteConfig.value.description),
    }),
    defineWebPage({
      name: seoTitle,
      description,
      url: pageUrl,
      datePublished: computed(() => schemaDate(fm.value.date)),
      dateModified: computed(() => schemaDate(fm.value.updated) || schemaDate(fm.value.date)),
    }),
    computed(() => {
      if (type.value !== 'article')
        return undefined
      const published = schemaDate(fm.value.date)
      const modified = schemaDate(fm.value.updated) || published
      const normalized = route.path.length > 1 ? route.path.replace(/\/+$/, '') : route.path
      return defineArticle({
        '@type': /^\/posts\/.+/.test(normalized) ? 'BlogPosting' : 'Article',
        'headline': seoTitle.value,
        ...(articleDescription.value ? { description: articleDescription.value } : {}),
        ...(published ? { datePublished: published } : {}),
        ...(modified ? { dateModified: modified } : {}),
        ...(pageUrl.value && /^https?:\/\//.test(siteConfig.value.url) ? { url: pageUrl.value } : {}),
        ...(image.value ? { image: image.value } : {}),
        'author': identityId
          ? { '@id': identityId }
          : { name: $t(siteConfig.value.author.name) },
      })
    }),
    computed(() => {
      const items = breadcrumbs.value
      if (!items)
        return undefined
      return defineBreadcrumb({
        itemListElement: items.map((entry, index) => ({
          name: entry.name,
          item: entry.item,
          position: index + 1,
        })),
      })
    }),
  ])

  useTimezone()
  useValaxyHead()
}
