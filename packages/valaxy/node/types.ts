import type Vue from '@vitejs/plugin-vue'
import type Components from 'unplugin-vue-components/vite'
import type { VitePluginConfig as UnoCSSConfig } from 'unocss/vite'
import type Pages from 'vite-plugin-pages'
import type { UserConfig as ViteUserConfig } from 'vite'
import type { presetAttributify, presetIcons, presetTypography, presetUno } from 'unocss'
import type { DefaultThemeConfig, UserSiteConfig } from '../types'
import type { ResolvedValaxyOptions } from './options'
import type { MarkdownOptions } from './markdown'

export type ValaxyConfig<ThemeConfig = DefaultThemeConfig> = UserSiteConfig<ThemeConfig> & ValaxyExtendConfig
export type UserConfig<ThemeConfig = DefaultThemeConfig> = ValaxyConfig<ThemeConfig>
/**
 * fn with options for theme config
 */
export type ValaxyConfigFn<ThemeConfig = DefaultThemeConfig> = (options: ResolvedValaxyOptions<ThemeConfig>) => ValaxyConfig | Promise<ValaxyConfig>
export type ValaxyConfigExport<ThemeConfig = DefaultThemeConfig> = ValaxyConfig<ThemeConfig> | ValaxyConfigFn<ThemeConfig>

export interface ValaxyExtendConfig {
  vite?: ViteUserConfig
  vue?: Parameters<typeof Vue>[0]
  components?: Parameters<typeof Components>[0]
  unocss?: UnoCSSConfig
  /**
   * unocss presets
   */
  unocssPresets?: {
    uno?: Parameters<typeof presetUno>[0]
    attributify?: Parameters<typeof presetAttributify>[0]
    icons?: Parameters<typeof presetIcons>[0]
    typography?: Parameters<typeof presetTypography>[0]
  }
  pages?: Parameters<typeof Pages>[0]
  /**
   * for markdown
   */
  markdown?: MarkdownOptions
  extendMd?: (ctx: {
    route: any
    data: Record<string, any>
    content: string
    excerpt?: string
    path: string
  }) => void
  addons?: ValaxyAddonOptions
}

export interface ValaxyAddon {
  global?: boolean
  props?: Record<string, any>
  options?: Record<string, any>
}
export type ValaxyAddonLike = ValaxyAddon | false | null | undefined
export type ValaxyAddonOptions = ([string, ValaxyAddonLike] | string)[] | Record<string, ValaxyAddonLike>

export type ValaxyAddonFn<ThemeConfig = DefaultThemeConfig> = (addonOptions: ValaxyAddonResolver, valaxyOptions: ResolvedValaxyOptions<ThemeConfig>) => ValaxyConfig | Promise<ValaxyConfig>
export type ValaxyAddonExport<ThemeConfig = DefaultThemeConfig> = ValaxyConfig<ThemeConfig> | ValaxyAddonFn<ThemeConfig>

export interface ValaxyAddonResolver {
  name: string
  root: string
  enable: boolean
  global: boolean
  props: Record<string, any>
  options: Record<string, any>
  configFile?: string
}
