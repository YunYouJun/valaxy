import type { ComputedRef, StyleValue } from 'vue'
import { computed } from 'vue'
import { useThemeConfig } from './config'

/**
 * get type card property
 * todo: test reactive
 */
export function usePostProperty(type?: string): {
  color: string
  icon: string
  styles: StyleValue | undefined | ComputedRef<StyleValue | undefined>
} {
  if (!type) {
    return {
      color: '',
      icon: '',
      styles: undefined,
    }
  }

  const themeConfig = useThemeConfig()

  if (!(type in themeConfig.value.types))
    type = 'link'

  const color = themeConfig.value.types[type].color
  const icon = themeConfig.value.types[type].icon

  const styles = computed<StyleValue | undefined>(() => {
    return type
      ? ({
          '--card-c-primary': color,
        })
      : undefined
  })

  return {
    color,
    icon,
    styles,
  }
}
