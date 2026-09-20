import type { ValaxyDevtoolsPlugin } from '../plugin'
import type { InstalledAddon } from '../shared/addons'

export interface ValaxyDevtoolsOptions {
  userRoot?: string
  /** Lazy loaders run only when the development tools start. */
  plugins?: (ValaxyDevtoolsPlugin | (() => Promise<ValaxyDevtoolsPlugin | { default: ValaxyDevtoolsPlugin }>))[]
  base?: string
  /** Actual site URL, resolved after the Vite server starts listening. */
  siteUrl?: () => string
  /** All enabled addons, including those without a DevTools extension. */
  getAddons?: () => Pick<InstalledAddon, 'name' | 'version'>[]
}
