import type { DefaultThemeConfig, ValaxyAddon } from '../../types'
import type { ResolvedValaxyOptions } from '../options'
import type { ValaxyConfig } from '../types'

export function defineValaxyAddon<AddonOptions = {}>(
  addonFunc: (addonOptions?: AddonOptions, valaxyOptions?: ResolvedValaxyOptions) => ValaxyAddon,
) {
  return addonFunc
}
export const defineAddon = defineValaxyAddon

export type ValaxyConfigExtendKey = 'vite' | 'vue' | 'unocss' | 'unocssPresets' | 'markdown' | 'extendMd' | 'addons'
export type ValaxyPickConfig = Pick<ValaxyConfig, ValaxyConfigExtendKey>
export type ValaxyTheme<ThemeConfig = DefaultThemeConfig> = ValaxyPickConfig & { themeConfig?: ThemeConfig }
export function defineTheme<ThemeConfig = DefaultThemeConfig>(
  theme: ValaxyTheme<ThemeConfig> | ((options: ResolvedValaxyOptions<ThemeConfig>) => ValaxyTheme<ThemeConfig>),
) {
  return theme
}
