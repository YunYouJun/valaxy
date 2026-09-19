import { readFile } from 'node:fs/promises'
import { load } from 'js-yaml'

interface PnpmWorkspaceManifest {
  overrides?: Record<string, string>
}

export async function readWorkspaceOverrides(filename: string): Promise<Record<string, string>> {
  const manifest = load(await readFile(filename, 'utf8')) as PnpmWorkspaceManifest | undefined
  return manifest?.overrides || {}
}
