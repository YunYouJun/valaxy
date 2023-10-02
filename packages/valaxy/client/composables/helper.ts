import { useElementBounding, useIntersectionObserver } from '@vueuse/core'
import type { Ref } from 'vue'
import { ref } from 'vue'

/**
 * trigger show invisible element
 * @param target
 */
export function useInvisibleElement(target: Ref<HTMLElement | undefined>) {
  const isVisible = ref(false)
  const { top } = useElementBounding(target)
  useIntersectionObserver(target, ([{ isIntersecting }]) => {
    isVisible.value = isIntersecting
  })

  const show = () => {
    // scroll when collapse is not visible
    if (!isVisible.value)
      window.scrollTo(0, top.value)
  }

  return {
    show,
  }
}
