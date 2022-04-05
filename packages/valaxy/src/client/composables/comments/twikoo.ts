import { isClient, useScriptTag } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export function useTwikoo(options: {} = {}) {
  const route = useRoute()

  const { locale } = useI18n()

  let twikoo: any

  /**
   * init waline
   * @param options waline options
   * @returns
   */
  function initTwikoo(options: {} = {}) {
    if (!isClient)
      return

    const defaultOptions = {
      el: '.comment #tcomment',
      lang: locale.value,
      path: route.path,
    }
    const twikooOptions = Object.assign(defaultOptions, options)
    return window.twikoo.init(twikooOptions)
  }

  // 直接使用 CDN
  useScriptTag('//cdn.jsdelivr.net/npm/twikoo@1.5.1/dist/twikoo.all.min.js', () => {
    twikoo = initTwikoo(options)
  })

  // eslint-disable-next-line no-console
  console.log(twikoo)
}
