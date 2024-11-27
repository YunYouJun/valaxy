import type { YunTheme } from '../types'
import { random } from 'valaxy'
import { computed } from 'vue'

export function useYunBanner(options: YunTheme.Banner) {
  const chars = computed(() => {
    const arr = []
    for (let i = 0; i < options.title.length; i++) {
      const rn = random(1.5, 3.5)
      arr.push(rn)
    }
    return arr
  })

  const totalCharHeight = computed(() => chars.value.reduce((a, b) => a + b, 0))

  return {
    chars,
    totalCharHeight,
  }
}
