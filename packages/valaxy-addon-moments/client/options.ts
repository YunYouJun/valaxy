import type { MomentsOptions } from '../types'
import { useAddonConfig } from 'valaxy'
import pkg from '../package.json'

export function useMomentsConfig() {
  return useAddonConfig<MomentsOptions>(pkg.name)
}
