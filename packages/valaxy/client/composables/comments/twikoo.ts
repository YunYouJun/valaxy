import { isClient, useScriptTag } from '@vueuse/core'
import { useConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

declare global {
  interface Window {
  // extend the window
    twikoo: {
      init: (options: {
        envId: string
        el: string
      } | any) => any
    }
  }
}

/**
 * A simple, safe, free comment system.
 * @public
 * @see https://github.com/imaegoo/twikoo
 * @see https://twikoo.js.org/
 * @param options
 */
export function useTwikoo(options: {} = {}) {
  const config = useConfig()
  const cdnPrefix = computed(() => config.value.cdn.prefix)

  const route = useRoute()
  const { locale } = useI18n()

  /**
   * init twikoo
   * @param options twikoo options
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
  useScriptTag(`${cdnPrefix.value}twikoo@1.5.1/dist/twikoo.all.min.js`, () => {
    initTwikoo(options)
  })
}
