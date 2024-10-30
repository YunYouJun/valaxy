import { computed } from 'vue'
import pkg from 'valaxy/package.json'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import { useSiteConfig } from '../../config'
import { useFrontmatter } from '../../composables'

export function useValaxyHead() {
  const { locale } = useI18n()

  const fm = useFrontmatter()
  const siteConfig = useSiteConfig()
  const title = computed(() => fm.value[`title_${locale.value}`] || fm.value.title)
  useHead({
    title,
    titleTemplate: computed(() => fm.value.titleTemplate || ((title: string) => title ? `${title} - ${siteConfig.value.title}` : siteConfig.value.title)),
    link: [
      {
        rel: 'icon',
        href: siteConfig.value.favicon,
        type: siteConfig.value.favicon?.endsWith('svg') ? 'image/svg+xml' : 'image/png',
      },
    ],
    meta: [
      { name: 'description', content: computed(() => siteConfig.value.description) },
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
