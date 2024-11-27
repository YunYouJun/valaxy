import { useHead } from '@unhead/vue'
import { useScriptTag } from '@vueuse/core'
import { computed } from 'vue'
import { useSiteConfig } from '../..'

/**
 * use MetingJS and Aplayer
 * @deprecated will migrate to valaxy-addon-meting
 * @see https://github.com/MoePlayer/APlayer
 * @see https://github.com/metowolf/MetingJS
 */
export function useAplayer() {
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
