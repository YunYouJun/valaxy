import type { DefaultTheme, ValaxyAddon } from '../../types'
import type { ValaxyNode, ValaxyNodeConfig } from './config'
import type { ResolvedValaxyOptions } from './options'

export interface ValaxyAddonResolver {
  name: string
  root: string
  enable: boolean
  global: boolean
  props: Record<string, any>
  options: Record<string, any>
  configFile?: string
  pkg: Record<string, any>

  setup?: (node: ValaxyNode) => void
}

export type ValaxyAddonLike = ValaxyAddon | false | null | undefined
export type ValaxyAddons = (ValaxyAddon | string)[] | Record<string, ValaxyAddonLike>

export type ValaxyAddonFn<ThemeConfig = DefaultTheme.Config> = (addonOptions: ValaxyAddonResolver, valaxyOptions: ResolvedValaxyOptions<ThemeConfig>) => ValaxyNodeConfig | Promise<ValaxyNodeConfig>
export type ValaxyAddonExport<ThemeConfig = DefaultTheme.Config> = ValaxyNodeConfig<ThemeConfig> | ValaxyAddonFn<ThemeConfig>
