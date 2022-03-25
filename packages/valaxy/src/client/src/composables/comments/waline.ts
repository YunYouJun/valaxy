import { isClient, useScriptTag } from '@vueuse/core'
import { onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export function useWaline(options: {} = {}) {
  const route = useRoute()

  const { locale } = useI18n()

  let waline: any

  /**
   * init waline
   * @param options waline options
   * @returns
   */
  function initWaline(options: {} = {}) {
    if (!isClient) return

    const defaultOptions = {
      el: '#waline',
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
    // @ts-expect-error waline type
    return window.Waline(walineOptions)
  }

  // 直接使用 CDN
  useScriptTag('//cdn.jsdelivr.net/npm/@waline/client', () => {
    waline = initWaline(options)
  })

  watch(() => route.path, (path) => {
    waline.update({
      path,
    })
  })

  watch(locale, (lang) => {
    waline.update({
      lang,
    })
  })

  onUnmounted(() => {
    waline.destroy()
  })
}
