import type { Argv } from 'yargs'
import type { DefaultTheme, ValaxyAddon } from '../../types'
import type { ValaxyNode, ValaxyNodeConfig } from './config'
import type { ResolvedValaxyOptions } from './options'

export interface ValaxyAddonCliContext {
  /** The Valaxy project root used by the addon command. */
  userRoot: string
}

/**
 * Extend the CLI below the addon's package-derived command namespace.
 *
 * @experimental The addon CLI interface may evolve as more adapters adopt it.
 */
export type ValaxyAddonExtendCli = (cli: Argv<object>, context: ValaxyAddonCliContext) => void

export interface ValaxyAddonResolver {
  name: string
  root: string
  enable: boolean
  global: boolean
  props: Record<string, any>
  options: Record<string, any>
  configFile?: string
  pkg: Record<string, any>

  extendCli?: ValaxyAddonExtendCli
  setup?: (node: ValaxyNode) => void
}

export type ValaxyNodeAddon = ValaxyAddon & {
  extendCli?: ValaxyAddonExtendCli
  setup?: ValaxyAddonResolver['setup']
}

export type ValaxyAddonLike = ValaxyNodeAddon | false | null | undefined
export type ValaxyAddons = (ValaxyNodeAddon | string)[] | Record<string, ValaxyAddonLike>

export type ValaxyAddonFn<ThemeConfig = DefaultTheme.Config> = (addonOptions: ValaxyAddonResolver, valaxyOptions: ResolvedValaxyOptions<ThemeConfig>) => ValaxyNodeConfig | Promise<ValaxyNodeConfig>
export type ValaxyAddonExport<ThemeConfig = DefaultTheme.Config> = ValaxyNodeConfig<ThemeConfig> | ValaxyAddonFn<ThemeConfig>
