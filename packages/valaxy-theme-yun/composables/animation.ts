import { useMotion } from '@vueuse/motion'
import type { MaybeRef } from 'vue'
import { cubicBezier } from '../client/constants'

/**
 * 统一的弹跳出现动画
 */
export function useYunSpringAnimation(target: MaybeRef<HTMLElement | undefined>, options: {
  /**
   * index order
   */
  i: number
  y?: number
  duration?: number
  /**
   * delay in ms
   */
  delay?: number
}) {
  useMotion(target, {
    initial: {
      opacity: 0,
      y: options.y || 40,
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        delay: options.i * (options.delay || 50),
        type: 'spring',
        ease: cubicBezier.easeIn,
        damping: 8,
        duration: options.duration || 400,
      },
    },
  })
}
