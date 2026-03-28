import type { ComputedRef, MaybeRefOrGetter, StyleValue } from 'vue'
import { computed, toValue } from 'vue'
import { useThemeConfig } from './config'

/**
 * get type card property (reactive)
 */
export function usePostProperty(type?: MaybeRefOrGetter<string | undefined>): {
  color: ComputedRef<string>
  icon: ComputedRef<string>
  styles: ComputedRef<StyleValue | undefined>
} {
  const themeConfig = useThemeConfig()

  const resolvedType = computed(() => {
    const t = toValue(type)
    if (!t)
      return undefined
    return t in themeConfig.value.types ? t : 'link'
  })

  const color = computed(() => {
    const t = resolvedType.value
    return t ? themeConfig.value.types[t].color : ''
  })

  const icon = computed(() => {
    const t = resolvedType.value
    return t ? themeConfig.value.types[t].icon : ''
  })

  const styles = computed<StyleValue | undefined>(() => {
    const c = color.value
    return c ? { '--card-c-primary': c } : undefined
  })

  return {
    color,
    icon,
    styles,
  }
}
