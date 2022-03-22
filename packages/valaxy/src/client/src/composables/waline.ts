import { onMounted } from 'vue'
import { getScript } from '~/utils'

export function useWaline(options: {}) {
  onMounted(() => {
    const defaultOptions = {
      el: '#waline',
      dark: 'html.dark',
      emoji: [
        'https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/bilibili',
        'https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/qq',
        'https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/weibo',
      ],
    }
    // 直接使用 CDN
    getScript('//cdn.jsdelivr.net/npm/@waline/client', () => {
      // @ts-expect-error waline type
      window.Waline(Object.assign(defaultOptions, options))
    })
  })
}
