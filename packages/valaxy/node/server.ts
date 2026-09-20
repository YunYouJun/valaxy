import type { InlineConfig, ViteDevServer } from 'vite'
import type { ValaxyNode, ValaxyServerOptions } from './types'

import process from 'node:process'
import { colors } from 'consola/utils'
import { createServer as createViteServer, mergeConfig as mergeViteConfig } from 'vite'
// import { serverSpinner } from './cli/utils/cli'
import { valaxyPrefix, vLogger } from './logger'
import { ViteValaxyPlugins } from './plugins/preset'
import { countPerformanceTime } from './utils/performance'

/**
 * with valaxyPrefix
 */
export function getServerInfoText(msg: string) {
  return `${valaxyPrefix} ${colors.gray(msg)}`
}

export async function createServer(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = {},
  serverOptions: ValaxyServerOptions = {},
) {
  // default editor vscode
  process.env.EDITOR = process.env.EDITOR || 'code'

  const { options } = valaxyApp

  // serverSpinner.text = getServerInfoText('init vite plugins ..')
  const pluginsTimer = countPerformanceTime()
  const plugins = await ViteValaxyPlugins(valaxyApp, serverOptions, viteConfig)
  vLogger.debug(`ViteValaxyPlugins: ${pluginsTimer()}`)

  // dynamic import to avoid bundle it in build
  const enableDevtools = options.config.devtools
  const vitePlugins = [
    ...plugins,
  ]
  let server: ViteDevServer
  if (options.config.mcp) {
    const { ValaxyMcp } = await import('@valaxyjs/devtools/mcp')
    let content: ReturnType<typeof import('./content')['createContentService']> | undefined
    const getContent = async () => {
      const { createContentService } = await import('./content')
      return content ||= createContentService(valaxyApp, {
        publicOnly: true,
        includeDrafts: typeof options.config.mcp === 'object' && options.config.mcp.includeDrafts,
        base: server.config.base,
        publicDir: server.config.publicDir || false,
      })
    }
    vitePlugins.push(ValaxyMcp({
      userRoot: options.userRoot,
      frontmatterDefaults: options.config.siteConfig?.frontmatter,
      content: {
        inspectPage: async path => (await getContent()).inspectPage(path),
        checkPage: async path => (await getContent()).checkPage(path),
        dispose: async () => content?.dispose(),
      },
      ...typeof options.config.mcp === 'object' ? options.config.mcp : {},
    }))
  }
  if (enableDevtools) {
    // only enable when dev — import both in parallel
    const devtoolsTimer = countPerformanceTime()
    const [vueDevtools, valaxyDevtools] = await Promise.all([
      import('vite-plugin-vue-devtools'),
      import('@valaxyjs/devtools'),
    ])
    vitePlugins.push(
      vueDevtools.default(),
      valaxyDevtools.default({
        userRoot: options.userRoot,
        getAddons: () => valaxyApp.options.addons.map(addon => ({ name: addon.name, version: addon.pkg.version })),
        plugins: options.addons.filter(addon => addon.enable && addon.devtools).map(addon => async () => addon.devtools!({
          userRoot: options.userRoot,
          addonRoot: addon.root,
          options: addon.options,
        })),
      }),
    )
    vLogger.debug(`devtools plugins: ${devtoolsTimer()}`)
  }

  // serverSpinner.text = getServerInfoText('merge vite config ...')
  const mergedViteConfig = mergeViteConfig(
    mergeViteConfig({
      devtools: enableDevtools ? { apply: 'serve', mcp: false } : false,
    }, viteConfig),
    {
      plugins: vitePlugins,
    },
  )
  // serverSpinner.text = getServerInfoText('create vite server ...')
  const viteServerTimer = countPerformanceTime()
  server = await createViteServer(mergedViteConfig)
  vLogger.debug(`createViteServer: ${viteServerTimer()}`)
  return server
}
