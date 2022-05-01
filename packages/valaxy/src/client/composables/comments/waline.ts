import { isClient, useScriptTag } from '@vueuse/core'
import { useHead } from '@vueuse/head'
import { onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export function useWaline(options: {} = {}) {
  useHead({
    link: [
      { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@waline/client/dist/waline.css' },
    ],
  })

  const route = useRoute()

  const { locale } = useI18n()

  let waline: any

  /**
   * init waline
   * @param options waline options
   * @returns
   */
  function initWaline(options: {} = {}) {
    if (!isClient)
      return

    const defaultOptions = {
      el: '.comment #waline',
      lang: locale.value,
      dark: 'html.dark',
      emoji: [
        'https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/bilibili',
        'https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/qq',
        'https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/weibo',
      ],
      path: route.path,
    }
    const walineOptions = Object.assign(defaultOptions, options)
    return window.Waline.init(walineOptions)
  }

  // 直接使用 CDN
  useScriptTag('//cdn.jsdelivr.net/npm/@waline/client/dist/waline.js', () => {
    waline = initWaline(options)
  })

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
