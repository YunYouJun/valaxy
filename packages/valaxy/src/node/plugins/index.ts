
import debug from 'debug'
import type { Plugin } from 'vite'
// import consola from 'consola'
import { resolveConfig } from '../config'
import type { ResolvedValaxyOptions } from '../options'
import { VALAXY_CONFIG_ID } from './valaxy'

export function createValaxyPlugin(options: ResolvedValaxyOptions): Plugin {
  const valaxyPrefix = '/@valaxy'

  let valaxyConfig = options.config

  // function updateServerWatcher(server: ViteDevServer) {
  // server.watcher.add()
  // }

  return {
    name: 'Valaxy',

    configureServer(server) {
      server.watcher.add(options.configFile)
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

      if (id.startsWith(valaxyPrefix))
        return ''
    },

    async handleHotUpdate(ctx) {
      // handle valaxy.config.ts hmr
      const { file, server } = ctx
      if (file !== options.configFile) return

      const { config } = await resolveConfig()

      // if (config.base !== options.config.base)
      //   consola.warn('[valaxy]: config.base has changed. Please restart the dev server.')
      valaxyConfig = config
      return [server.moduleGraph.getModuleById(`/${VALAXY_CONFIG_ID}`)!]
    },
  }
}
