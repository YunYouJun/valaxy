import type { StyleValue } from 'vue'
import { computed } from 'vue'
import { useThemeConfig } from './config'

/**
 * get type card property
 * todo: test reactive
 */
export function usePostProperty(type?: string) {
  if (!type) {
    return {
      color: '',
      icon: '',
      styles: {},
    }
  }

  const themeConfig = useThemeConfig()

  if (!(type in themeConfig.value.types))
    type = 'link'

  const color = themeConfig.value.types[type].color
  const icon = themeConfig.value.types[type].icon

  const styles = computed(() => {
    return {
      '--card-c-primary': type && color,
    } as StyleValue
  })

  return {
    color,
    icon,
    styles,
  }
}
