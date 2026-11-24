import { useHead } from '@unhead/vue'
import { computed, onMounted } from 'vue'
import pkg from '../../../package.json' with { type: 'json' }

import { useFrontmatter, useValaxyI18n } from '../../composables'
import { useRuntimeConfig, useSiteConfig } from '../../config'
import { resolveSiteUrl, withBase } from '../../utils'
import { useLayout } from '../../utils/layouts'
import { usePageSeo } from './usePageSeo'

export function useValaxyHead() {
  const { $t, $tO, locale } = useValaxyI18n()

  const fm = useFrontmatter()
  const layout = useLayout()
  const siteConfig = useSiteConfig()
  const runtimeConfig = useRuntimeConfig()
  const { description, pageUrl, noindex } = usePageSeo()
  const $title = computed(() => $tO(fm.value.title))
  const canonicalUrl = computed(() => /^https?:\/\//.test(siteConfig.value.url) ? pageUrl.value : '')
  const feedLinks = computed(() => {
    const feed = runtimeConfig.value.feed
    if (!feed)
      return []
    const title = $t(siteConfig.value.title)
    const hasOrigin = /^https?:\/\//i.test(siteConfig.value.url)
    return (['rss', 'atom'] as const).map(kind => ({
      rel: 'alternate' as const,
      type: kind === 'rss' ? 'application/rss+xml' as const : 'application/atom+xml' as const,
      title,
      href: hasOrigin
        ? resolveSiteUrl(siteConfig.value.url, `/${feed[kind]}`)
        : withBase(`/${feed[kind]}`),
    }))
  })

  useHead({
    htmlAttrs: {
      lang: () => locale.value || siteConfig.value.lang || 'en',
    },
    title: $title,
    titleTemplate: (title) => {
      const siteTitle = $t(siteConfig.value.title)
      return $tO(fm.value.titleTemplate) || (title ? `${title} - ${siteTitle}` : siteTitle)
    },
    link: [
      {
        rel: 'icon',
        href: withBase(siteConfig.value.favicon),
        type: siteConfig.value.favicon?.endsWith('svg') ? 'image/svg+xml' : 'image/png',
      },
    ],
    meta: [
      computed(() => {
        return {
          name: 'description',
          content: description.value,
        }
      }),
      {
        name: 'generator',
        content: `Valaxy ${pkg.version}`,
      },
    ],

    templateParams: {
      schemaOrg: {
        host: /^https?:\/\//i.test(siteConfig.value.url)
          ? `${siteConfig.value.url.replace(/\/+$/, '')}/`
          : siteConfig.value.url,
      },
    },
  })

  useHead(computed(() => {
    const link = [
      ...feedLinks.value,
      ...(canonicalUrl.value ? [{ rel: 'canonical' as const, href: canonicalUrl.value }] : []),
    ]
    // YAML frontmatter can supply the layout name as a number.
    // A 404 document stays out of the index and does not publish a canonical URL.
    if (String(layout.value) === '404')
      return { meta: [{ name: 'robots', content: 'noindex' }], link: feedLinks.value }

    if (noindex.value)
      return { meta: [{ name: 'robots', content: 'noindex, follow' }], link }

    return link.length ? { link } : {}
  }))

  // Add mac detection class on client side only, after hydration
  // to avoid SSR/client mismatch on the <html> element
  onMounted(() => {
    document.documentElement.classList.toggle(
      'mac',
      /Mac|iPhone|iPod|iPad/i.test(navigator.platform),
    )
  })
}
