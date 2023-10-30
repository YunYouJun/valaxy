import { useScriptTag } from '@vueuse/core'
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useSiteConfig } from 'valaxy'

/**
 * use MetingJS and Aplayer
 * @see https://github.com/MoePlayer/APlayer
 * @see https://github.com/metowolf/MetingJS
 */
export function useMeting() {
  const siteConfig = useSiteConfig()
  const cdnPrefix = computed(() => siteConfig.value.cdn.prefix)

  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: `${cdnPrefix.value}aplayer/dist/APlayer.min.css`,
      },
    ],
  })

  // load meting after aplayer
  useScriptTag(`${cdnPrefix.value}aplayer/dist/APlayer.min.js`, () => {
    useScriptTag(`${cdnPrefix.value}meting@2/dist/Meting.min.js`)
  })
}
