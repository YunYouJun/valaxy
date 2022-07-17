import type { ResolvedValaxyOptions } from 'valaxy/node'
import type { ThemeUserConfig } from '../types'

/**
 * generateSafelist by config
 * @param themeConfig
 * @returns
 */
export function generateSafelist(options: ResolvedValaxyOptions<ThemeUserConfig>) {
  const themeConfig = options.config.themeConfig || {}
  const safelist = []

  const types = themeConfig.types
  if (types) {
    for (const type in types)
      safelist.push(types[type]?.icon)
  }

  if (themeConfig.footer?.icon?.name)
    safelist.push(themeConfig.footer?.icon?.name)

  if (themeConfig.menu?.custom?.icon)
    safelist.push(themeConfig.menu?.custom?.icon)

  if (themeConfig.pages) {
    themeConfig.pages?.forEach((item) => {
      item.icon && safelist.push(item.icon)
    })
  }

  return safelist
}
