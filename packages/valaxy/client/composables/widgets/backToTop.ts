import { isClient, useWindowScroll } from '@vueuse/core'
import { computed, ref } from 'vue'

/**
 * You can use href="#" to back to top
 * @description 你可以使用它来编写自己的 backToTop
 */
export function useBackToTop(options: {
  /**
   * show backToTop button, when height > offset
   */
  offset: number
} = {
  offset: 100,
}) {
  if (!isClient) {
    return {
      percentage: ref(0),
      show: ref(false),
    }
  }

  const { y } = useWindowScroll()
  const percentage = computed(() => {
    return y.value / (document.body.scrollHeight - window.innerHeight)
  })

  const show = computed(() => y.value > options.offset)

  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return {
    percentage,
    show,
    backToTop,
  }
}
