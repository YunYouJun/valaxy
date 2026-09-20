import { readFile } from 'node:fs/promises'
import { load } from 'js-yaml'

interface PnpmWorkspaceManifest {
  overrides?: Record<string, string>
  catalog?: Record<string, string>
  catalogs?: Record<string, Record<string, string>>
}

export async function readWorkspaceOverrides(filename: string): Promise<Record<string, string>> {
  const manifest = load(await readFile(filename, 'utf8')) as PnpmWorkspaceManifest | undefined
  return Object.fromEntries(Object.entries(manifest?.overrides || {}).map(([name, version]) => {
    if (!version.startsWith('catalog:'))
      return [name, version]

    // Generated blogs do not have the monorepo's catalogs.
    const catalogName = version.slice('catalog:'.length)
    const catalog = catalogName ? manifest?.catalogs?.[catalogName] : manifest?.catalog
    const resolved = catalog?.[name]
    if (!resolved)
      throw new Error(`Missing catalog entry for ${name} in ${catalogName || 'default'}`)
    return [name, resolved]
  }))
}
