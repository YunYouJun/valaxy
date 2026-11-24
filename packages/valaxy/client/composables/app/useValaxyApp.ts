import type { RouteRecordNormalized } from 'vue-router'
import { defineArticle, defineBreadcrumb, definePerson, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'
import { useSeoMeta } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildBreadcrumbItems, isGeneratedPaginationPath, publicAuthor, schemaDate, schemaNodeId } from '../../../shared/seo'
import { useFrontmatter, useLocale, useValaxyHead, useValaxyI18n } from '../../composables'
import { useTimezone } from '../../composables/global'
import { useSiteConfig } from '../../config'
import { useRouterStore } from '../../stores/router'
import { useLayout } from '../../utils/layouts'
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
  const routerStore = useRouterStore()
  const layout = useLayout()
  const { toggleLocale } = useLocale()
  // if lang exist, toggle the locale
  if (route.query.lang) {
    toggleLocale(route.query.lang as string)
  }

  // seo
  const { description, routePath, pagePath, pageUrl, image, type } = usePageSeo()
  const seoTitle = computed(() => $tO(fm.value.title) || $t(siteConfig.value.title))
  const isNotFound = computed(() => String(layout.value) === '404')
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
    ogImageAlt: computed(() => image.value ? seoTitle.value : undefined),
    ogType: type,
    ogUrl: pageUrl,
    twitterCard: computed(() => image.value ? 'summary_large_image' : 'summary'),
    twitterDescription: description,
    twitterImage: image,
    twitterTitle: seoTitle,
  })

  const articleDescription = computed(() => asText($tO(fm.value.description)) || asText(route.meta.seoDescription))
  const staticRouteMap = computed(() => {
    const map = new Map<string, RouteRecordNormalized>()
    for (const record of routerStore.routes) {
      if (record.meta?.isLayout || record.redirect || record.path.includes(':') || record.path.includes('*'))
        continue
      if (String(record.meta?.layout) === '404' || isGeneratedPaginationPath(record.path))
        continue
      const fmMeta = record.meta?.frontmatter as Record<string, unknown> | undefined
      if (!fmMeta && !(record.components && Object.keys(record.components).length > 0))
        continue
      const key = record.path.length > 1 ? record.path.replace(/\/+$/, '') : record.path
      if (!key || key === '/')
        continue
      const existing = map.get(key)
      const hasFm = Boolean(fmMeta)
      const existingHasFm = Boolean(existing?.meta?.frontmatter)
      if (
        !existing
        || (hasFm && !existingHasFm)
        || (hasFm === existingHasFm && !existing.path.endsWith('/') && record.path.endsWith('/'))
      ) {
        map.set(key, record)
      }
    }
    return map
  })
  const breadcrumbs = computed(() => {
    if (isNotFound.value)
      return undefined
    const routes = staticRouteMap.value
    const path = pagePath.value.startsWith('/') && !pagePath.value.startsWith('//')
      ? pagePath.value
      : routePath.value
    return buildBreadcrumbItems({
      siteUrl: siteConfig.value.url,
      siteTitle: $t(siteConfig.value.title),
      pageTitle: seoTitle.value,
      path,
      resolveAncestor: (ancestorPath) => {
        const record = routes.get(ancestorPath)
        if (!record)
          return undefined
        const fmMeta = record.meta?.frontmatter as { title?: string | Record<string, unknown> } | undefined
        return {
          path: record.path,
          name: asText($tO(fmMeta?.title)) || undefined,
        }
      },
    })
  })

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
      datePublished: computed(() => schemaDate(fm.value.date, siteConfig.value.timezone)),
      dateModified: computed(() => schemaDate(fm.value.updated, siteConfig.value.timezone) || schemaDate(fm.value.date, siteConfig.value.timezone)),
    }),
    computed(() => {
      if (isNotFound.value || type.value !== 'article')
        return undefined
      const published = schemaDate(fm.value.date, siteConfig.value.timezone)
      const modified = schemaDate(fm.value.updated, siteConfig.value.timezone) || published
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
