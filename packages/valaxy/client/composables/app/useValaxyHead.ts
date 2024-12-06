import { useHead } from '@unhead/vue'
import pkg from 'valaxy/package.json'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useFrontmatter } from '../../composables'
import { useSiteConfig } from '../../config'

export function useValaxyHead() {
  const { locale } = useI18n()

  const fm = useFrontmatter()
  const siteConfig = useSiteConfig()
  const title = computed<string>(() => fm.value[`title_${locale.value}`] || fm.value.title)
  useHead({
    title,
    titleTemplate: (title) => {
      return fm.value.titleTemplate || (title ? `${title} - ${siteConfig.value.title}` : siteConfig.value.title)
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
          content: fm.value.description || siteConfig.value.description,
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
