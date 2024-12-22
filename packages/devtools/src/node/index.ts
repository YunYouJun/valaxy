import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { ClientFunctions, ServerFunctions } from '../../rpc'
import type { ValaxyDevtoolsOptions } from './types'
import c from 'picocolors'
import sirv from 'sirv'
import { createRPCServer } from 'vite-dev-rpc'
import { NAMESPACE } from '../config'
import { DIR_CLIENT } from '../dir'
import { registerApi } from './api'
import { getFunctions } from './functions'

export function ValaxyDevtools(options: ValaxyDevtoolsOptions = {}): Plugin {
  let config: ResolvedConfig

  const isDevDevtools = import.meta.env?.VITE_VALAXY_DEVTOOLS_DEV === 'true'
  function configureServer(server: ViteDevServer) {
    const _print = server.printUrls
    const base = (options.base ?? server.config.base) || '/'

    const functions = getFunctions(server, options)
    createRPCServer<ClientFunctions, ServerFunctions>(NAMESPACE, server.ws, functions)

    const devtoolsUrl = `${base}__valaxy_devtools__/`
    if (!isDevDevtools) {
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

    // register api to vite.server
    registerApi(server, config)
  }

  const plugin = <Plugin>{
    name: NAMESPACE,

    enforce: 'pre',

    // config: () => { },

    configResolved(_config) {
      config = _config
    },

    configureServer(server) {
      configureServer(server)
    },
  }

  return plugin
}

export default ValaxyDevtools
