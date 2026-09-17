import type { DevframeInstance } from 'devframe/initiate'
import type { Plugin, ViteDevServer } from 'vite'
import type { ValaxyDevtoolsOptions } from './types'
import { createPluginFromDevframe } from '@vitejs/devtools-kit/node'
import { initDevframe } from 'devframe/initiate'
import { serveStaticNodeMiddleware } from 'devframe/utils/serve-static'
import { NAMESPACE } from '../config'
import { DEVTOOLS_FRAME_ID, resolveDevtoolsBase, resolveDevtoolsLogo } from '../shared/constants'
import { createValaxyDevframe } from './definition'
import { watchResources } from './watch'

export { createValaxyDevframe } from './definition'

export function ValaxyDevtools(options: ValaxyDevtoolsOptions = {}): Plugin {
  let stopWatching: (() => void) | undefined
  let standalone: DevframeInstance | undefined
  let definition: ReturnType<typeof createValaxyDevframe> | undefined

  function resolveOptions(server?: ViteDevServer, base = '/') {
    return {
      ...options,
      base: options.base ?? base,
      siteUrl: options.siteUrl ?? (() => server?.resolvedUrls?.local[0] || ''),
    }
  }

  return {
    name: NAMESPACE,
    apply: 'serve',
    devtools: {
      capabilities: { build: false },
      async setup(ctx) {
        const resolved = resolveOptions(ctx.viteServer, ctx.viteConfig.base)
        definition = createValaxyDevframe(resolved)
        const plugin = createPluginFromDevframe(definition, {
          base: resolveDevtoolsBase(resolved.base),
          dock: {
            category: 'framework',
            groupId: 'valaxy:tools',
            frameId: DEVTOOLS_FRAME_ID,
            subTabs: { protocol: 'postmessage' },
            visibility: 'false',
          },
        })
        ctx.docks.register({ id: 'valaxy:tools', type: 'group', title: 'Valaxy', icon: resolveDevtoolsLogo(resolved.base), category: 'framework', defaultChildId: 'valaxy' })
        await plugin.devtools!.setup(ctx)
        const manifest = await ctx.rpc.invokeLocal('valaxy:get-extensions')
        for (const extension of manifest.plugins) {
          for (const panel of extension.panels)
            ctx.docks.register({ ...panel, type: 'iframe', groupId: 'valaxy:tools', category: 'app' })
        }
        if (ctx.viteServer)
          stopWatching = await watchResources(ctx.viteServer, ctx, resolved)
      },
    },
    async configureServer(server) {
      // Kit owns the instance when enabled; otherwise serve the same definition.
      if (server.config.devtools && server.config.devtools.enabled)
        return

      const resolved = resolveOptions(server, server.config.base)
      // HTTP/2-only servers use Devframe's SSE endpoint; HTTP/1 supports WS.
      const httpServer = server.httpServer && 'headersTimeout' in server.httpServer ? server.httpServer : undefined
      definition = createValaxyDevframe(resolved)
      const frame = definition
      standalone = initDevframe({
        ...frame,
        async setup(ctx, info) {
          // The standalone node adapter only accepts its own base. Mount sibling
          // addon assets on Vite's Connect stack, using Devframe's static server.
          const mountStatic = ctx.host.mountStatic
          ctx.host.mountStatic = (base, source) => {
            if (typeof source === 'string')
              server.middlewares.use(base, serveStaticNodeMiddleware(source))
            else return mountStatic(base, source)
          }
          await frame.setup(ctx, info)
        },
      }, {
        base: resolveDevtoolsBase(resolved.base),
        server: httpServer,
        ws: httpServer ? undefined : false,
        mcp: false,
      })
      server.middlewares.use(standalone.nodeMiddleware)
      stopWatching = await watchResources(server, await standalone.context, resolved)
    },
    async closeBundle() {
      stopWatching?.()
      stopWatching = undefined
      try {
        await definition?.dispose()
      }
      finally {
        await standalone?.close()
        standalone = undefined
        definition = undefined
      }
    },
  }
}

export default ValaxyDevtools
