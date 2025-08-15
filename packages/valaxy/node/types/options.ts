import type { MarkdownEnv } from 'unplugin-vue-markdown/types'
import type { DefaultTheme, RedirectItem, RuntimeConfig } from '../../types'
import type { ValaxyAddonResolver } from './addon'
import type { ValaxyNodeConfig } from './config'

// for cli entry
export interface ValaxyEntryOptions {
  /**
   * theme name
   */
  theme?: string
  userRoot: string
}

export interface ValaxyServerOptions {
  onConfigReload?: (newConfig: ValaxyNodeConfig, config: ValaxyNodeConfig, force?: boolean) => void
}

export interface ResolvedValaxyOptions<ThemeConfig = DefaultTheme.Config> {
  mode: 'dev' | 'build'
  /**
   * package.json root
   */
  pkgRoot: string
  /**
   * temp dir, store d.ts and other temp files
   * .valaxy
   */
  tempDir: string
  /**
   * Client root path
   * @default 'valaxy/client'
   */
  clientRoot: string
  /**
   * User root path
   * @default process.cwd()
   */
  userRoot: string
  /**
   * Theme root path
   */
  themeRoot: string
  /**
   * Addon root path
   */
  addonRoots: string[]
  /**
   * clientRoot, themeRoot, ...addonRoots, userRoot
   */
  roots: string[]
  theme: string
  /**
   * Valaxy Config
   */
  config: ValaxyNodeConfig<ThemeConfig> & {
    /**
     * Generated Runtime Config
     */
    runtimeConfig: RuntimeConfig
  }
  /**
   * config file path
   */
  configFile: string
  siteConfigFile: string
  themeConfigFile: string
  pages: string[]
  /**
   * all addons
   * Record<package-name, OptionResolver>
   */
  addons: ValaxyAddonResolver[]
  /**
   * Collect redirect rule
   */
  redirects: RedirectItem[]

  env: MarkdownEnv & {
    links: string[]
  }
}
