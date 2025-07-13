import type { YunTheme } from '../types'
import { random, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'

export function useYunBanner(options: YunTheme.Banner) {
  const { $tO } = useValaxyI18n()

  const bannerTitle = computed(() => {
    if (Array.isArray(options.title)) {
      return options.title
    }
    return $tO<string | string[]>(options.title)
  })
  const chars = computed(() => {
    const arr = []
    for (let i = 0; i < bannerTitle.value.length; i++) {
      const rn = random(1.5, 3.5)
      arr.push(rn)
    }
    return arr
  })

  const totalCharHeight = computed(() => chars.value.reduce((a, b) => a + b, 0))

  return {
    bannerTitle,
    chars,
    totalCharHeight,
  }
}
