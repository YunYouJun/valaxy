import process from 'node:process'

// https://github.com/unjs/c12
// use c12 instead of unconfig, because c12 faster a lot
// unconfig load config need 2-3s, c12 only need 0.2s

// import type { LoadConfigSource } from 'unconfig'
// import { loadConfig } from 'unconfig'

// import { normalizePath } from 'vite'
import type { UserInputConfig } from 'c12'
import { loadConfig } from 'c12'

export interface LoadConfigFromFileOptions {
  cwd?: string
  // rewrite?: LoadConfigSource['rewrite']
}

export async function loadConfigFromFile<T extends UserInputConfig>(
  file: string,
  options: LoadConfigFromFileOptions = {},
) {
  const { config: userValaxyConfig, configFile } = await loadConfig<T, any>({
    name: file,

    // sources: {
    //   files: file,
    //   // less for speed
    //   extensions: ['ts', 'js'],
    //   // rewrite: options.rewrite,
    // },
    cwd: options.cwd || process.cwd(),
  })
  // const configFile = normalizePath(sources[0] || '')

  // if (file.startsWith('valaxy'))
  // console.log(userValaxyConfig, configFile)

  return {
    config: userValaxyConfig,
    configFile,
  }
}
