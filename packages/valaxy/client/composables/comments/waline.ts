import { isClient } from '@vueuse/core'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import type { WalineInitOptions, WalineInstance } from '@waline/client'
import { init } from '@waline/client'

import '@waline/client/dist/waline.css'
import { useConfig } from '../../config'

/**
 * A Simple, Safe Comment System.
 * @public
 * @see https://github.com/walinejs/waline
 * @see https://waline.js.org/
 * @param options
 * @returns
 */
export function useWaline(options: {} = {}) {
  const config = useConfig()
  const cdnPrefix = computed(() => config.value.cdn.prefix)

  const route = useRoute()

  const { locale } = useI18n()

  let waline: WalineInstance | null | undefined

  onMounted(() => {
    waline = initWaline(options)
  })

  /**
   * init waline
   * @param options waline options
   * @returns
   */
  function initWaline(options: {} = {}) {
    if (!isClient)
      return

    const defaultOptions: WalineInitOptions = {
      el: '.comment #waline',
      serverURL: '',
      lang: locale.value,
      dark: 'html.dark',
      emoji: [
        `${cdnPrefix.value}@waline/emojis/bilibili/`,
        `${cdnPrefix.value}@waline/emojis/qq/`,
        `${cdnPrefix.value}@waline/emojis/weibo/`,
      ],
      path: route.path,
    }
    const walineOptions = Object.assign(defaultOptions, options)
    return init(walineOptions)
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
