import { useHead } from '@unhead/vue'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import pkg from '../../../package.json' with { type: 'json' }

import { useFrontmatter, useValaxyI18n } from '../../composables'
import { useSiteConfig } from '../../config'
import { resolveSiteUrl, withBase } from '../../utils'

export function useValaxyHead() {
  const { $t, $tO, locale } = useValaxyI18n()

  const fm = useFrontmatter()
  const route = useRoute()
  const siteConfig = useSiteConfig()
  const $title = computed(() => $tO(fm.value.title))
  const canonicalUrl = computed(() => {
    const siteUrl = siteConfig.value.url
    if (!/^https?:\/\//.test(siteUrl))
      return ''

    const pagePath = fm.value.url || route.path
    return resolveSiteUrl(siteUrl, pagePath)
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
          content: $tO(fm.value.description) || $t(siteConfig.value.description),
        }
      }),
      {
        name: 'generator',
        content: `Valaxy ${pkg.version}`,
      },
    ],

    templateParams: {
      schemaOrg: {
        host: siteConfig.value.url,
      },
    },
  })

  useHead(computed(() => canonicalUrl.value
    ? { link: [{ rel: 'canonical', href: canonicalUrl.value }] }
    : {}))

  // Add mac detection class on client side only, after hydration
  // to avoid SSR/client mismatch on the <html> element
  onMounted(() => {
    document.documentElement.classList.toggle(
      'mac',
      /Mac|iPhone|iPod|iPad/i.test(navigator.platform),
    )
  })
}
