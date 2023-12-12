import { useDark, useToggle } from '@vueuse/core'

import 'valaxy/client/styles/common/view-transition.css'

export const isDark = useDark()
export const toggleDark = useToggle(isDark)

export function toggleDarkWithTransition(event: MouseEvent, options: { duration?: number, easing?: EffectTiming['easing'] } = {}) {
  // @ts-expect-error startViewTransition is not defined
  if (!document.startViewTransition) {
    toggleDark()
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )

  // @ts-expect-error startViewTransition is not defined
  const transition = document.startViewTransition(() => {
    toggleDark()
  })

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    document.documentElement.animate(
      {
        clipPath: isDark.value ? clipPath.reverse() : clipPath,
      },
      {
        duration: options.duration || 300,
        easing: options.easing || 'ease-in',
        pseudoElement: isDark.value ? '::view-transition-old(root)' : '::view-transition-new(root)',
      },
    )
  })
}
