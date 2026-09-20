import type { AddonCatalogEntry, AddonLocale, LocalizedValaxyAddon } from './types/addons'
import { addons } from './constants/addons'

export { addons } from './constants/addons'
export type { AddonCatalogEntry, AddonKind, AddonLocale, LocalizedAddonText, LocalizedValaxyAddon } from './types/addons'

export const officialAddons = addons.filter(addon => addon.kind === 'official')

export function normalizeAddonLocale(locale: string): AddonLocale {
  return locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

export function getAddonDocsPath(addon: AddonCatalogEntry, locale: string): string | undefined {
  if (!addon.docsPath)
    return undefined

  return normalizeAddonLocale(locale) === 'zh-CN'
    ? `/zh${addon.docsPath}`
    : addon.docsPath
}

export function localizeAddon(addon: AddonCatalogEntry, locale: string): LocalizedValaxyAddon {
  const normalizedLocale = normalizeAddonLocale(locale)
  const { author, description, docsPath: _docsPath, ...rest } = addon

  return {
    ...rest,
    author: Array.isArray(author) ? [...author] : [author],
    description: description[normalizedLocale],
    docs: getAddonDocsPath(addon, normalizedLocale),
  }
}
