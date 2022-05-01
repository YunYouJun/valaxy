// import { loadConfig } from 'c12'
import { loadConfig } from 'unconfig'
import defu from 'defu'
import type { ValaxyConfig } from '../types'
import { defaultValaxyConfig } from '../types'
import type { ValaxyEntryOptions } from './options'

// for user config
export async function resolveConfig(options: ValaxyEntryOptions = {}) {
  // c12 merge array twice, so i deprecated it
  // const { config, configFile } = await loadConfig<ValaxyConfig>({
  //   name: 'valaxy',
  //   defaults: defaultValaxyConfig,
  // })

  const { config: userConfig, sources } = await loadConfig<ValaxyConfig>({
    sources: [
      {
        files: 'valaxy.config',
        extensions: ['ts', 'js', 'mjs', 'cjs', 'json'],
      },
    ],
    merge: false,
  })
  const configFile = sources[0]
  const config = defu(userConfig, defaultValaxyConfig)

  const theme = options.theme || config.theme || 'yun'

  try {
    const { defaultThemeConfig } = await import(`valaxy-theme-${theme}`)
    config.themeConfig = defu(config.themeConfig, defaultThemeConfig)
    const pkg = await import(`valaxy-theme-${theme}/package.json`)
    config.themeConfig.pkg = pkg
  }
  catch (e) {
    console.error(`valaxy-theme-${theme} doesn't have default config`)
  }

  return {
    config,
    configFile,
    theme,
  }
}
