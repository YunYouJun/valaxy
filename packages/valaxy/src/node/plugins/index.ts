
import type { Plugin } from 'vite'
// import consola from 'consola'
import { resolveConfig } from '../config'
import type { ResolvedValaxyOptions, ValaxyServerOptions } from '../options'
import { VALAXY_CONFIG_ID } from './valaxy'

export function createValaxyPlugin(options: ResolvedValaxyOptions, serverOptions: ValaxyServerOptions = {}): Plugin {
  const valaxyPrefix = '/@valaxy'

  let valaxyConfig = options.config

  return {
    name: 'Valaxy',

    configureServer(server) {
      server.watcher.add([
        options.configFile,
        options.userRoot,
        options.themeRoot,
      ])
    },

    resolveId(id) {
      if (id.startsWith(valaxyPrefix))
        return id
      return null
    },

    load(id) {
      if (id === `/${VALAXY_CONFIG_ID}`)
        // stringify twice for \"
        return `export default ${JSON.stringify(JSON.stringify(valaxyConfig))}`

      // regenerate unocss config
      if (id === '/unocss:config')
        return

      if (id.startsWith(valaxyPrefix))
        return ''
    },

    async handleHotUpdate(ctx) {
      // handle valaxy.config.ts hmr
      const { file, server } = ctx
      if (file !== options.configFile) return

      const { config } = await resolveConfig()

      serverOptions.onConfigReload?.(config, options.config)
      Object.assign(options.config, config)

      // if (config.base !== options.config.base)
      //   consola.warn('[valaxy]: config.base has changed. Please restart the dev server.')
      valaxyConfig = config

      const moduleIds = [`/${VALAXY_CONFIG_ID}`]
      const moduleEntries = [
        ...Array.from(moduleIds).map(id => server.moduleGraph.getModuleById(id)),
      ].filter(<T>(item: T): item is NonNullable<T> => !!item)

      return moduleEntries
    },
  }
}
