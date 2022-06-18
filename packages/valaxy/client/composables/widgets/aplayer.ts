import { useScriptTag } from '@vueuse/core'
import { useHead } from '@vueuse/head'

/**
 * use MetingJS and Aplayer
 * https://github.com/MoePlayer/APlayer
 * https://github.com/metowolf/MetingJS
 */
export function useAplayer() {
  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css',
      },
    ],
  })

  // load meting after aplayer
  useScriptTag('https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js', () => {
    useScriptTag('https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js')
  })
}
