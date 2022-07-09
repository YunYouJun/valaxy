import { isClient } from '@vueuse/core'
import { onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import type { WalineInitOptions, WalineInstance } from '@waline/client'

import '@waline/client/dist/waline.css'
import { cdnPrefix } from '../../utils'

/**
 * A Simple, Safe Comment System.
 * @public
 * @see https://github.com/walinejs/waline
 * @see https://waline.js.org/
 * @param options
 * @returns
 */
export function useWaline(options: {} = {}, cdn = cdnPrefix) {
  if (!isClient)
    return

  const route = useRoute()

  const { locale } = useI18n()

  let waline: WalineInstance | null | undefined

  onMounted(() => {
    initWaline(options)
  })

  /**
   * init waline
   * @param options waline options
   * @returns
   */
  function initWaline(options: {} = {}) {
    const defaultOptions: WalineInitOptions = {
      el: '.comment #waline',
      serverURL: '',
      lang: locale.value,
      dark: 'html.dark',
      emoji: [
        `${cdn}@waline/emojis/bilibili/`,
        `${cdn}@waline/emojis/qq/`,
        `${cdn}@waline/emojis/weibo/`,
      ],
      path: route.path,
    }
    const walineOptions = Object.assign(defaultOptions, options)

    import('@waline/client').then(({ init }) => {
      waline = init(walineOptions)
    })
  }

  watch(() => route.path, (path) => {
    if (!waline)
      return
    waline.update({
      path,
    })
  })

  watch(locale, (lang) => {
    if (!waline)
      return
    waline.update({
      lang,
    })
  })

  onUnmounted(() => {
    if (!waline)
      return
    waline.destroy()
  })

  return waline
}
