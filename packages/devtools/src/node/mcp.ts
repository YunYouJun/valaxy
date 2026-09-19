import type { Plugin } from 'vite'
import { mountMcpHttp } from 'devframe/adapters/mcp'
import { createHostContext } from 'devframe/node'
import { H3, toNodeHandler } from 'h3'
import pathe from 'pathe'
import pkg from '../../package.json'
import { registerValaxyMcpTools } from './mcp-tools'

/** Options for the local, read-only MCP development server. */
export interface ValaxyMcpOptions {
  /** Site directory containing pages/. Defaults to the Vite project root. */
  userRoot?: string
  /** Include draft pages. Hidden and password-protected pages remain excluded. */
  includeDrafts?: boolean
  /** Inherited visibility fields from site.config.ts. Never exported to clients. */
  frontmatterDefaults?: Record<string, unknown>
  /** Framework-aware tools supplied by Valaxy; absent for a standalone plugin. */
  content?: {
    inspectPage: (path: string) => Promise<unknown>
    checkPage: (path: string) => Promise<unknown>
    dispose?: () => Promise<void>
  }
}

/**
 * Mount an isolated MCP content endpoint on the Vite development server.
 * @param options - Site directory and draft visibility.
 * @returns A development-only Vite plugin with connection logging and cleanup.
 */
export function ValaxyMcp(options: ValaxyMcpOptions = {}): Plugin {
  let dispose: (() => Promise<void>) | undefined
  let stopLogging: (() => void) | undefined
  return {
    name: 'valaxy:mcp',
    apply: 'serve',
    async configureServer(server) {
      const userRoot = options.userRoot || server.config.root
      const base = server.config.base.replace(/\/$/, '')
      const endpoint = `${base}/__valaxy_mcp`
      const ctx = await createHostContext({
        cwd: userRoot,
        mode: 'dev',
        host: {
          mountStatic() {},
          mountConnectionMeta() {},
          resolveOrigin: () => server.resolvedUrls?.local[0] || 'http://localhost',
          getStorageDir: scope => pathe.join(userRoot, 'node_modules/.valaxy/mcp', scope),
        },
      })
      registerValaxyMcpTools(ctx.agent, { ...options, userRoot })
      const app = new H3()
      const mounted = mountMcpHttp(app, ctx, endpoint, {
        serverName: 'valaxy',
        serverVersion: pkg.version,
        exposeSharedState: false,
      })
      dispose = mounted.dispose
      const middleware = toNodeHandler(app)
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== endpoint)
          return next()
        return middleware(req, res)
      })
      const logConnection = () => {
        const local = server.resolvedUrls?.local[0]
        if (local) {
          const url = new URL(endpoint, local)
          server.config.logger.info(`  ➜  Valaxy MCP (read-only): ${url.href}\n     Client header: Origin: ${url.origin}`)
        }
      }
      // Valaxy prints its own startup banner instead of calling Vite.printUrls().
      // Wait until Vite has populated resolvedUrls after the listening event.
      let pending: ReturnType<typeof setImmediate> | undefined
      const onListening = () => {
        pending = setImmediate(logConnection)
      }
      server.httpServer?.once('listening', onListening)
      stopLogging = () => {
        server.httpServer?.off('listening', onListening)
        if (pending)
          clearImmediate(pending)
      }
    },
    async closeBundle() {
      stopLogging?.()
      await dispose?.()
      await options.content?.dispose?.()
      dispose = undefined
    },
  }
}
