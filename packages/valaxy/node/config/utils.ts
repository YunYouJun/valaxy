import type { ResolvedValaxyOptions } from '../options'
import process from 'node:process'

// https://github.com/unjs/c12
// use c12 instead of unconfig, because c12 faster a lot
// unconfig load config need 2-3s, c12 only need 0.2s
// use jiti directly is 0.0006s 0.6ms
// write in valaxy directly can be fastest and solve cjs esm in vite

import { loadConfig } from 'define-config-ts'

export interface LoadConfigFromFileOptions {
  cwd?: string
  valaxyOptions?: ResolvedValaxyOptions
}

export type UserInputConfig = Record<string, any>
export interface ResolvedConfig<
  T extends UserInputConfig = UserInputConfig,
> {
  config: T
  configFile: string
}

type ConfigFunction<T> = (options: ResolvedValaxyOptions) => (T | Promise<T>)

export async function loadConfigFromFile<T extends UserInputConfig>(
  file: string,
  options: LoadConfigFromFileOptions = {},
): Promise<ResolvedConfig<T>> {
  const { config, configFile } = await loadConfig<T | ConfigFunction<T>>({
    name: file,
    cwd: options.cwd || process.cwd(),
  })

  let userConfig: T = config as T
  if (typeof config === 'function')
    userConfig = await config(options.valaxyOptions || {} as ResolvedValaxyOptions)

  return {
    config: userConfig,
    configFile,
  }
}
