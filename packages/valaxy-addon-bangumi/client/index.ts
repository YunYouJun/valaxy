import type { BangumiOptions } from '../types'
import { useAddonConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * get addon config
 */
export function useAddonBangumi() {
  const addon = useAddonConfig<BangumiOptions>('valaxy-addon-bangumi')
  return computed<BangumiOptions>(() => {
    const options = addon.value?.options
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
