/**
 * @packageDocumentation valaxy plugin
 */

import type { Plugin } from 'vite'
import type { DefaultTheme, PageDataPayload, Pkg } from '../../../types'
import type { StateManager } from '../../app/state'
import type { ResolvedValaxyOptions, ValaxyNodeConfig, ValaxyServerOptions } from '../../types'
import { Buffer } from 'node:buffer'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'fs-extra'
import { dirname, join, relative, resolve } from 'pathe'
import { Valaxy } from '../../app'
import { resolveUserThemeConfig } from '../../config'
import { vLogger } from '../../logger'
import { resolveOptions } from '../../options'
import { toAtFS } from '../../utils'
import { getPagePath } from '../../utils/pageSources'
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
export async function createValaxyPlugin(
  options: ResolvedValaxyOptions,
  serverOptions: ValaxyServerOptions = {},
  state: StateManager = Valaxy.state,
): Promise<Plugin[]> {
  let { config: valaxyConfig } = options

  const valaxyPrefix = '/@valaxy'

  let hasDeadLinks = false
  const protectedMarkdown = new Set<string>()
  const protectedSourceAliases = new Set<string>()

  let markdownToVue: Awaited<ReturnType<typeof createMarkdownToVueRenderFn>>

  return [
    {
      name: 'valaxy:loader',
      enforce: 'pre',

      async configResolved(_resolvedConfig) {
        markdownToVue = await createMarkdownToVueRenderFn(
          options,
          state,
        )
      },

      configureServer(server) {
        if (options.configFile) {
          server.watcher.add(options.configFile)
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
          const { code: newCode, deadLinks, includes, hasPrivateSource } = await markdownToVue(code, id)

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

          // The compiler captures this before encryption metadata is removed.
          // Keep it separate from state, which buildEnd clears.
          if (hasPrivateSource) {
            protectedMarkdown.add(resolve(id))
            includes.forEach(file => protectedMarkdown.add(resolve(file)))
          }
          return newCode
        }
      },

      renderStart() {
        if (hasDeadLinks && !valaxyConfig.build.ignoreDeadLinks)
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
            ...Array.from(moduleIds, id => server.moduleGraph.getModuleById(id)),
          ].filter(<T>(item: T): item is NonNullable<T> => !!item)

          return moduleEntries
        }

        const configFiles = [options.configFile, options.siteConfigFile, resolve(options.themeRoot, 'valaxy.config.ts')]

        // Re-resolve raw layers so adding/removing legacy footnote settings
        // never mistakes merged defaults for explicit Floating Vue configuration.
        if (configFiles.includes(file)) {
          const { config } = await resolveOptions({ userRoot: options.userRoot })
          return reloadConfigAndEntries(config)
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

        // send headers
        if (file.endsWith('.md')) {
          const endCount = countPerformanceTime()

          const content = await read()

          // overwrite src so vue plugin can handle the HMR
          const { code, pageData } = await markdownToVue(content, file)

          const path = `/${getPagePath(file, options.userRoot) || relative(`${options.userRoot}/pages`, file)}`
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

    {
      name: 'valaxy:private-sourcemaps',
      enforce: 'post',
      outputOptions(output) {
        const transformPath = output.sourcemapPathTransform
        if (!transformPath)
          return
        return {
          ...output,
          sourcemapPathTransform(source, sourcemapPath) {
            const transformed = transformPath(source, sourcemapPath)
            // Windows callbacks may return native separators while the bundler
            // emits forward slashes. Normalize only separators, not URL syntax.
            if (protectedMarkdown.has(resolve(dirname(sourcemapPath), source.split('?')[0])))
              protectedSourceAliases.add(transformed.replaceAll('\\', '/'))
            return transformed
          },
        }
      },
      generateBundle: {
        order: 'post',
        handler(outputOptions, bundle) {
          if (!protectedMarkdown.size)
            return

          // Rolldown restores original sourcesContent even when a transform
          // returns an empty map. Sanitize the final maps, including inline maps
          // already serialized into chunks, without disabling public mappings.
          const outputDir = outputOptions.dir || dirname(outputOptions.file || '.')
          const sanitize = (map: { sources?: string[], sourcesContent?: (string | null)[], sourceRoot?: string }, fileName: string) => {
            map.sourcesContent?.forEach((_content, index, contents) => {
              const source = map.sources?.[index]
              if (source && (protectedSourceAliases.has(source.replaceAll('\\', '/')) || protectedMarkdown.has(resolve(outputDir, dirname(fileName), map.sourceRoot || '', source.split('?')[0]))))
                contents[index] = null
            })
          }
          for (const output of Object.values(bundle)) {
            if (output.type === 'asset' && output.fileName.endsWith('.map')) {
              const map = JSON.parse(typeof output.source === 'string' ? output.source : Buffer.from(output.source).toString())
              sanitize(map, output.fileName)
              output.source = JSON.stringify(map)
            }
            else if (output.type === 'chunk') {
              if (output.map)
                sanitize(output.map, output.fileName)
              output.code = output.code.replace(/(\/\/[#@] sourceMappingURL=data:application\/json[^,]*;base64,)(\S+)/g, (_match, prefix, encoded) => {
                const map = JSON.parse(Buffer.from(encoded, 'base64').toString())
                sanitize(map, output.fileName)
                return prefix + Buffer.from(JSON.stringify(map)).toString('base64')
              })
            }
          }
        },
      },
    },

    {
      name: 'valaxy:state-cleanup',
      enforce: 'post',
      buildEnd() {
        // Catch environments recorded before a later transform aborted.
        state.clear()
      },
      closeBundle() {
        // Build pipelines release after their final client/server bundle so
        // that SSG can reuse heavy resources. A dev pipeline has no later
        // bundle, so release its highlighter when the server closes.
        if (options.mode === 'dev')
          state.dispose()
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
