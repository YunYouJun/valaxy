import process from 'node:process'

// https://github.com/unjs/c12
// use c12 instead of unconfig, because c12 faster a lot
// unconfig load config need 2-3s, c12 only need 0.2s
// use jiti directly is 0.0006s 0.6ms
// write in valaxy directly can be fastest and solve cjs esm in vite

import { fileURLToPath } from 'node:url'
import jiti from 'jiti'
import { resolve } from 'pathe'
import consola from 'consola'
import type { ResolvedValaxyOptions } from '../options'

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

export function loadConfig<T extends UserInputConfig = UserInputConfig>(options: {
  name: string
  cwd: string
}): ResolvedConfig<T> {
  const { name, cwd } = options
  const filePath = resolve(cwd, `${name}.config.ts`)

  let data = {} as T

  try {
    data = jiti(fileURLToPath(import.meta.url), {
      interopDefault: true,
      requireCache: false,
      esmResolve: true,
    })(filePath)
  }
  catch (e) {
    consola.error(`Failed to load config file: ${filePath}`)
  }

  return {
    config: data,
    configFile: filePath,
  }
}

type ConfigFunction<T> = (options: ResolvedValaxyOptions) => (T | Promise<T>)

export async function loadConfigFromFile<T extends UserInputConfig>(
  file: string,
  options: LoadConfigFromFileOptions = {},
): Promise<ResolvedConfig<T>> {
  const { config, configFile } = loadConfig<T | ConfigFunction<T>>({
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
