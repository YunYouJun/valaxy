import { useHead } from '@unhead/vue'
import pkg from 'valaxy/package.json'
import { computed } from 'vue'

import { useFrontmatter, useValaxyI18n } from '../../composables'
import { useSiteConfig } from '../../config'

export function useValaxyHead() {
  const { $t, $tO } = useValaxyI18n()

  const fm = useFrontmatter()
  const siteConfig = useSiteConfig()
  const $title = computed(() => $tO(fm.value.title))

  useHead({
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

    script: [
      {
        id: 'check-mac-os',
        innerHTML: `document.documentElement.classList.toggle('mac', /Mac|iPhone|iPod|iPad/i.test(navigator.platform))`,
        async: true,
      },
    ],
  })
}
