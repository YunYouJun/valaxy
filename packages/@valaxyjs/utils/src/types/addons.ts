export type AddonKind = 'official' | 'community'
export type AddonLocale = 'en' | 'zh-CN'

export interface LocalizedAddonText {
  'en': string
  'zh-CN': string
}

export interface AddonCatalogEntry {
  name: string
  author: string | readonly string[]
  icon: string
  repo: string
  kind: AddonKind
  docsPath?: string
  description: LocalizedAddonText
  tags: readonly string[]
}

export interface LocalizedValaxyAddon extends Omit<AddonCatalogEntry, 'author' | 'description' | 'docsPath'> {
  author: string[]
  description: string
  docs?: string
}
