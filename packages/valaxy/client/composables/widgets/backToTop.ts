import { createSharedComposable, isClient, useEventListener, useRafFn, useResizeObserver, useWindowSize } from '@vueuse/core'
import { computed, shallowRef } from 'vue'

/** Track only the vertical offset, without measuring scroll boundaries. */
export const useWindowScrollY = createSharedComposable(() => {
  const y = shallowRef(0)

  if (isClient) {
    const update = () => {
      y.value = window.scrollY
    }

    useEventListener('scroll', update, { passive: true })
    // Pick up restored scroll positions outside the hydration task.
    useRafFn(update, { once: true })
  }

  return computed(() => y.value)
})

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
      percentage: shallowRef(0),
      show: shallowRef(false),
    }
  }

  const y = useWindowScrollY()
  const documentHeight = shallowRef(0)
  const { height: viewportHeight } = useWindowSize()
  // Read the document height after layout and reuse it between size changes.
  useResizeObserver([document.body, document.documentElement], () => {
    documentHeight.value = document.scrollingElement?.scrollHeight ?? 0
  })
  const percentage = computed(() => {
    const scrollRange = documentHeight.value - viewportHeight.value
    return scrollRange > 0 ? y.value / scrollRange : 0
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
