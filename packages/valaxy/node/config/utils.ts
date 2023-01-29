import type { LoadConfigSource } from 'unconfig'
import { loadConfig } from 'unconfig'
import { normalizePath } from 'vite'

export interface LoadConfigFromFileOptions {
  cwd?: string
  rewrite?: LoadConfigSource['rewrite']
}

export async function loadConfigFromFile<T>(
  file: string,
  options: LoadConfigFromFileOptions = {},
) {
  const { config: userValaxyConfig, sources } = await await loadConfig<T>({
    sources: { files: file, rewrite: options.rewrite },
    cwd: options.cwd || process.cwd(),
  })
  const configFile = normalizePath(sources[0] || '')

  return {
    config: userValaxyConfig,
    configFile,
  }
}
