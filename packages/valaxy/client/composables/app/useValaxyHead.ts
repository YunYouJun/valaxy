import { useHead } from '@unhead/vue'
import { computed, onMounted } from 'vue'
import pkg from '../../../package.json' with { type: 'json' }

import { useFrontmatter, useValaxyI18n } from '../../composables'
import { useSiteConfig } from '../../config'

export function useValaxyHead() {
  const { $t, $tO, locale } = useValaxyI18n()

  const fm = useFrontmatter()
  const siteConfig = useSiteConfig()
  const $title = computed(() => $tO(fm.value.title))

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
        href: siteConfig.value.favicon,
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

  // Add mac detection class on client side only, after hydration
  // to avoid SSR/client mismatch on the <html> element
  onMounted(() => {
    document.documentElement.classList.toggle(
      'mac',
      /Mac|iPhone|iPod|iPad/i.test(navigator.platform),
    )
  })
}
