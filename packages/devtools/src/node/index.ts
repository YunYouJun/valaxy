import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { ValaxyDevtoolsOptions } from './types'
import { createProxyMiddleware } from 'http-proxy-middleware'
import c from 'picocolors'
import sirv from 'sirv'
import { DIR_CLIENT } from '../dir'
import { registerApi } from './api'

const NAME = 'valaxy:devtools'

// import.meta.env.VITE_DEV_VALAXY_DEVTOOLS = 'true'

export default function ValaxyDevtools(options: ValaxyDevtoolsOptions = {}): Plugin {
  let config: ResolvedConfig

  function configureServer(server: ViteDevServer) {
    const _print = server.printUrls
    const base = (options.base ?? server.config.base) || '/'

    const devtoolsUrl = `${base}__valaxy_devtools__/`
    if (import.meta.env?.VITE_DEV_VALAXY_DEVTOOLS === 'true') {
      server.middlewares.use(devtoolsUrl, createProxyMiddleware({
        target: 'http://localhost:5001/#/',
        changeOrigin: true,
      }) as any)
    }
    else {
      server.middlewares.use(devtoolsUrl, sirv(DIR_CLIENT, {
        single: true,
        dev: true,
      }))
    }

    server.printUrls = () => {
      let host = `${config.server.https ? 'https' : 'http'}://localhost:${config.server.port || '80'}`

      const url = server.resolvedUrls?.local[0]

      if (url) {
        try {
          const u = new URL(url)
          host = `${u.protocol}//${u.host}`
        }
        catch (error) {
          console.warn('Parse resolved url failed:', error)
        }
      }

      _print()

      const colorUrl = (url: string) => c.green(url.replace(/:(\d+)\//, (_, port) => `:${c.bold(port)}/`))
      // eslint-disable-next-line no-console
      console.log(`  ${c.green('➜')}  ${c.bold('Inspect')}: ${colorUrl(`${host}${base}__inspect/`)}`)
    }

    registerApi(server, config)
  }

  const plugin = <Plugin>{
    name: NAME,

    enforce: 'pre',

    configResolved(_config) {
      config = _config
    },

    configureServer(server) {
      configureServer(server)
    },
  }

  return plugin
}
