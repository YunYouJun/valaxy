import { useHead } from '@unhead/vue'
import { computed, onMounted } from 'vue'
import pkg from '../../../package.json' with { type: 'json' }

import { useFrontmatter, useValaxyI18n } from '../../composables'
import { useSiteConfig } from '../../config'
import { withBase } from '../../utils'
import { usePageSeo } from './usePageSeo'

export function useValaxyHead() {
  const { $t, $tO, locale } = useValaxyI18n()

  const fm = useFrontmatter()
  const siteConfig = useSiteConfig()
  const { description, pageUrl } = usePageSeo()
  const $title = computed(() => $tO(fm.value.title))
  const canonicalUrl = computed(() => /^https?:\/\//.test(siteConfig.value.url) ? pageUrl.value : '')

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
