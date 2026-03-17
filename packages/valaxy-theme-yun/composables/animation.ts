import type { MotionVariants } from '@vueuse/motion'
import { cubicBezier } from '../client/constants'

/**
 * Generate variants for `v-motion` directive with spring animation.
 *
 * Uses `v-motion` (official SSR-safe approach) instead of `useMotion` composable.
 * The directive implements `getSSRProps` which pre-renders the initial styles
 * into SSR/SSG HTML, preventing hydration mismatch.
 */
export function yunSpringVariants(options: {
  /**
   * index order for stagger delay
   */
  i: number
  y?: number
  duration?: number
  /**
   * delay in ms between each item
   */
  delay?: number
  /**
   * callback when enter animation completes
   */
  onComplete?: () => void
}): MotionVariants<never> {
  return {
    initial: {
      opacity: 0,
      y: options.y ?? 40,
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        delay: options.i * (options.delay ?? 50),
        type: 'spring',
        ease: cubicBezier.easeIn,
        damping: 8,
        duration: options.duration ?? 400,
        ...(options.onComplete ? { onComplete: options.onComplete } : {}),
      },
    },
  }
}
