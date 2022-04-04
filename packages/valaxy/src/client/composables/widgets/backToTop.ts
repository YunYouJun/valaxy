import { useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'

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
  const { y } = useWindowScroll()

  const percentage = computed(() => {
    return y.value / (document.body.scrollHeight - window.innerHeight)
  })

  const show = computed(() => y.value > options.offset)

  return {
    percentage,
    show,
  }
}
