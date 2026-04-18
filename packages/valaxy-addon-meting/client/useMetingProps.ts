import type { MetingProps } from '../types'
import { computed } from 'vue'
import { useAddonMeting } from './options'

/**
 * Merge addon config props with component props.
 * Component props take precedence over addon config.
 *
 * @param componentProps - Props passed to the component
 * @param defaults - Default values (lowest priority)
 */
export function useMetingProps(componentProps: Partial<MetingProps>, defaults?: Partial<MetingProps>) {
  const addonMeting = useAddonMeting()
  return computed<MetingProps>(() => ({
    ...defaults,
    ...addonMeting.value?.props,
    ...componentProps,
  }))
}
