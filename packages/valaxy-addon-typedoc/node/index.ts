import type { ContentLoaderContext } from 'valaxy'
import type { Plugin } from 'vite'
import { defineValaxyAddon, loadAllContent } from 'valaxy'
import { createTypeDocLoader } from './loader'

export interface TypeDocAddonOptions {
  /** TypeDoc JSON configuration, relative to the Valaxy project. */
  options: string
  /** Source/configuration globs relative to the Valaxy project, used for cache invalidation and watching. */
  watch: string[]
  /** URL directory for generated reference pages. @default '/api/' */
  routeBase?: string
  /** Keep a handwritten landing page at routeBase. @default false */
  excludeIndex?: boolean
  /** Add the generated navigation to Press sidebars. @default true */
  sidebar?: boolean
}

export const addonTypeDoc = defineValaxyAddon<TypeDocAddonOptions>((settings) => {
  if (!settings?.options || !settings.watch?.length)
    throw new Error('[typedoc] An options file and source watch globs are required.')
  return {
    name: 'valaxy-addon-typedoc',
    options: settings,
    setup(node) {
      const loader = createTypeDocLoader(settings, node.options.userRoot)
      node.options.config.loaders ??= []
      node.options.config.loaders.push(loader)
      const plugin: Plugin = {
        name: 'valaxy-addon-typedoc:watch',
        apply: 'serve',
        async configureServer(server) {
          const ctx: ContentLoaderContext = { node, cacheDir: `${node.options.tempDir}/content`, mode: 'dev' }
          let closed = false
          let timer: ReturnType<typeof setTimeout> | undefined
          let pending = Promise.resolve()
          const update = () => {
            clearTimeout(timer)
            timer = setTimeout(() => {
              pending = pending.then(async () => {
                if (closed)
                  return
                await node.hooks.callHook('content:before-load')
                await loadAllContent([loader], ctx)
                await node.hooks.callHook('content:loaded')
                server.watcher.add(await loader.watchPaths())
                const config = server.moduleGraph.getModuleById('/@valaxyjs/config')
                if (config)
                  server.moduleGraph.invalidateModule(config)
                // Added/deleted routes and navigation must become visible together.
                server.ws.send({ type: 'full-reload' })
              }).catch(error => server.config.logger.error(`[typedoc] ${error}`))
            }, 200)
          }
          const change = (file: string) => {
            if (loader.isSource(file))
              update()
          }
          server.watcher.add(await loader.watchPaths())
          server.watcher.on('add', change).on('change', change).on('unlink', change)
          server.httpServer?.once('close', () => {
            closed = true
            clearTimeout(timer)
            server.watcher.off('add', change).off('change', change).off('unlink', change)
          })
        },
      }
      node.options.config.vite ??= {}
      node.options.config.vite.plugins ??= []
      node.options.config.vite.plugins.push(plugin)
    },
  }
})
