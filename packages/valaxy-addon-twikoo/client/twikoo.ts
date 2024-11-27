import type { ComputedRef } from 'vue'
import type { TwikooOptions } from '../types'
import { isClient, useScriptTag } from '@vueuse/core'
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAddonTwikoo } from './options'

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
export function useTwikoo(options: ComputedRef<TwikooOptions | undefined>, version = 'latest') {
  const siteConfig = useSiteConfig()
  const cdnPrefix = computed(() => siteConfig.value.cdn.prefix)

  const route = useRoute()
  const { locale } = useI18n()

  /**
   * init twikoo
   */
  function initTwikoo(twikooOptions: TwikooOptions) {
    if (!isClient)
      return

    const defaultOptions = {
      el: '.comment #tcomment',
      lang: locale.value,
      path: route.path,
    }
    const newTwikooOptions = Object.assign(defaultOptions, twikooOptions || {})
    return window.twikoo.init(newTwikooOptions)
  }

  // 直接使用 CDN
  useScriptTag(`${cdnPrefix.value}twikoo@${version}/dist/twikoo.all.min.js`, () => {
    if (options.value)
      initTwikoo(options.value)
  })
}

export function useTwikooWithOptions(version = 'latest') {
  const addonTwikoo = useAddonTwikoo()
  const options = computed(() => addonTwikoo.value.options)
  useTwikoo(options, version)
}
