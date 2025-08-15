/**
 * @packageDocumentation valaxy plugin
 */

import type { Plugin, ResolvedConfig } from 'vite'
import type { DefaultTheme, PageDataPayload, Pkg, SiteConfig } from '../../../types'
import type { ResolvedValaxyOptions, ValaxyNodeConfig, ValaxyServerOptions } from '../../types'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'fs-extra'
import { join, relative, resolve } from 'pathe'
import { defaultSiteConfig, mergeValaxyConfig, resolveSiteConfig, resolveUserThemeConfig } from '../../config'
import { replaceArrMerge } from '../../config/merge'
import { vLogger } from '../../logger'
import { processValaxyOptions, resolveOptions, resolveThemeValaxyConfig } from '../../options'
import { toAtFS } from '../../utils'
import { countPerformanceTime } from '../../utils/performance'
import { templates } from '../../virtual'
import { createMarkdownToVueRenderFn } from '../markdown/markdownToVue'

/**
 * vue component render null
 */
const nullVue = 'import { defineComponent } from "vue"; export default defineComponent({ render: () => null });'

/**
 * generate app vue from root/app.vue
 * @param root
 */
function generateAppVue(root: string) {
  const appVue = join(root, 'App.vue')
  if (!fs.existsSync(appVue))
    return nullVue

  const scripts = [
    `import AppVue from "${toAtFS(appVue)}"`,
    'export default AppVue',
  ]

  return scripts.join('\n')
}

/**
 * create valaxy loader (custom virtual modules)
 * multiple plugins
 * @internal
 * @param options
 * @param serverOptions
 */
export async function createValaxyPlugin(options: ResolvedValaxyOptions, serverOptions: ValaxyServerOptions = {}): Promise<Plugin[]> {
  let { config: valaxyConfig } = options

  const valaxyPrefix = '/@valaxy'

  let hasDeadLinks = false

  let markdownToVue: Awaited<ReturnType<typeof createMarkdownToVueRenderFn>>
  let viteConfig: ResolvedConfig

  return [
    {
      name: 'valaxy:loader',
      enforce: 'pre',

      async configResolved(resolvedConfig) {
        viteConfig = resolvedConfig
        markdownToVue = await createMarkdownToVueRenderFn(
          options,
          viteConfig,
        )
      },

      configureServer(server) {
        if (options.configFile) {
          server.watcher.add(options.configFile)
          // @TODO configDeps
          // configDeps.forEach((file) => server.watcher.add(file))
        }

        server.watcher.add([
          options.clientRoot,
          options.themeRoot,
          options.userRoot,
        ])
      },

      resolveId(id) {
        if (id.startsWith(valaxyPrefix))
          return id
        return null
      },

      async load(id) {
        const template = templates.find(t => t.id === id)
        if (template) {
          return {
            code: await template.getContent.call(this, options),
            map: { mappings: '' },
          }
        }

        if (id === '/@valaxyjs/context') {
          return `export default ${JSON.stringify(JSON.stringify({
            userRoot: options.userRoot,
            // clientRoot: options.clientRoot,
          }))}`
        }

        // TODO: custom dynamic css vars
        // if (id === 'virtual:valaxy-css-vars') {}

        // root client
        if (id === '/@valaxyjs/AppVue')
          return generateAppVue(options.clientRoot)

        if (id === '/@valaxyjs/UserAppVue')
          return generateAppVue(options.userRoot)

        if (id === '/@valaxyjs/ThemeAppVue')
          return generateAppVue(options.themeRoot)

        if (id.startsWith(valaxyPrefix)) {
          return {
            code: '',
            map: { mappings: '' },
          }
        }
      },

      async transform(code, id) {
        if (id.endsWith('.md')) {
          // transform .md files into vueSrc so plugin-vue can handle it
          const { code: newCode, deadLinks, includes } = await markdownToVue(code, id)

          if (deadLinks.length) {
            hasDeadLinks = true

            consola.error(`Dead links found in ${id}`)
            consola.error(deadLinks)
          }
          if (includes.length) {
            includes.forEach((i) => {
              this.addWatchFile(i)
            })
          }

          return newCode
        }
      },

      renderStart() {
        if (hasDeadLinks && !(valaxyConfig.ignoreDeadLinks || valaxyConfig.build.ignoreDeadLinks))
          throw new Error('One or more pages contain dead links.')
      },

      /**
       * handle config hmr
       * @param ctx
       */
      async handleHotUpdate(ctx) {
        const { file, server, read } = ctx

        const reloadConfigAndEntries = (config: ValaxyNodeConfig) => {
          serverOptions.onConfigReload?.(config, options.config)
          Object.assign(options.config, config)

          valaxyConfig = config

          const moduleIds = ['/@valaxyjs/config', '/@valaxyjs/context']
          const moduleEntries = [
            ...Array.from(moduleIds).map(id => server.moduleGraph.getModuleById(id)),
          ].filter(<T>(item: T): item is NonNullable<T> => !!item)

          return moduleEntries
        }

        const configFiles = [options.configFile]

        // handle valaxy.config.ts hmr
        if (configFiles.includes(file)) {
          const { config } = await resolveOptions({ userRoot: options.userRoot })
          return reloadConfigAndEntries(config)
        }

        // siteConfig
        if (file === options.siteConfigFile) {
          const { siteConfig } = await resolveSiteConfig(options.userRoot)
          valaxyConfig.siteConfig = replaceArrMerge<SiteConfig, [SiteConfig]>(siteConfig as SiteConfig, defaultSiteConfig)
          return reloadConfigAndEntries(valaxyConfig)
        }

        // themeConfig
        if (file === options.themeConfigFile) {
          const { themeConfig } = await resolveUserThemeConfig(options)
          const pkg = valaxyConfig.themeConfig.pkg
          // @ts-expect-error pkg
          themeConfig.pkg = pkg
          valaxyConfig.themeConfig = themeConfig as (DefaultTheme.Config & { pkg: Pkg })
          return reloadConfigAndEntries(valaxyConfig)
        }

        if (file === resolve(options.themeRoot, 'valaxy.config.ts')) {
          const themeValaxyConfig = await resolveThemeValaxyConfig(options)
          const valaxyConfig = mergeValaxyConfig(options.config, themeValaxyConfig)
          const { config } = await processValaxyOptions(options, valaxyConfig)
          return reloadConfigAndEntries(config)
        }

        // send headers
        if (file.endsWith('.md')) {
          const endCount = countPerformanceTime()

          const content = await read()

          // overwrite src so vue plugin can handle the HMR
          const { code, pageData } = await markdownToVue(content, file)

          const path = `/${relative(`${options.userRoot}/pages`, file)}`
          const payload: PageDataPayload = {
            path,
            pageData,
          }

          server.hot.send({
            type: 'custom',
            event: 'valaxy:pageData',
            data: payload,
          })

          vLogger.success(`${colors.yellow('[HMR]')} ${file} ${colors.dim(`updated in ${endCount()}`)}`)
          ctx.read = () => code
        }
      },
    },

    // {
    //   // we need post encrypt html
    //   name: 'valaxy:encrypt:post',
    //   enforce: 'pre',
    //   async transform(code, id) {
    //     if (id.endsWith('.md'))
    //       code = await transformEncrypt(code, id)

    //     return code
    //   },
    // },
  ]
}
