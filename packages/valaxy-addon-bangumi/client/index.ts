import type { ValaxyAddon } from 'valaxy'
import type { BangumiOptions } from '../types'
import { useRuntimeConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * get addon config
 */
export function useAddonBangumi() {
  const runtimeConfig = useRuntimeConfig()
  return computed<BangumiOptions>(() => {
    const options = (runtimeConfig.value.addons['valaxy-addon-bangumi'] as ValaxyAddon<BangumiOptions>).options
    if (!options) {
      console.warn('`valaxy-addon-bangumi` options not found')
      return { api: '' }
    }

    return {
      ...options,
      bilibiliEnabled: options.bilibiliEnabled ?? true,
      bgmEnabled: options.bgmEnabled ?? true,
      pageSize: options.pageSize ?? 15,
      customEnabled: options.customEnabled ?? false,
      customLabel: options.customLabel ?? '自定义',
    }
  })
}
