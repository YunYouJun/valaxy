import type { UseDarkOptions } from '@vueuse/core'
import { useDark, useToggle } from '@vueuse/core'
import { computed, nextTick } from 'vue'

export function useValaxyDark(options: {
  /**
   * Options for `useDark`
   * disableTransition default is `true`
   * @see https://vueuse.org/core/useDark
   * @url https://paco.me/writing/disable-theme-transitions
   */
  useDarkOptions?: UseDarkOptions
  /**
   * Enable circle transition when toggling dark mode
   * Then use `toggleDarkWithTransition` instead of `toggleDark`
   */
  circleTransition?: boolean

  themeColor?: {
    light?: string
    dark?: string
  }
} = {}) {
  const isDark = useDark(options.useDarkOptions)
  const toggleDark = useToggle(isDark)

  const themeColor = computed(() => isDark.value
    ? (options.themeColor?.dark || '#000')
    : (options.themeColor?.light || '#fff'))

  if (options.circleTransition)
    import('valaxy/client/styles/common/view-transition.css')

  const enableTransitions = () =>
    'startViewTransition' in document
    && window.matchMedia('(prefers-reduced-motion: no-preference)').matches

  function toggleDarkWithTransition(event: MouseEvent, options: { duration?: number, easing?: EffectTiming['easing'] } = {}) {
    if (!enableTransitions()) {
      toggleDark()
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )

    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]

    const transition = document.startViewTransition(async () => {
      toggleDark()
      await nextTick()
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: options.duration ?? 200,
          easing: options.easing ?? 'ease-in',
          fill: 'forwards',
          pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`,
        },
      )
    })
  }

  return {
    /**
     * Dark mode state, sync with app store
     *
     * You can also use `const appStore = useAppStore(); appStore.isDark` to get the value
     */
    isDark,
    themeColor,

    toggleDark,
    toggleDarkWithTransition,
  }
}
