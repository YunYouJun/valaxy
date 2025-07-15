import type { PluginOption, ViteDevServer } from 'vite'

import type { ValaxyServerOptions } from '../options'
import type { ValaxyNode } from '../types'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'

import UnheadVite from '@unhead/addons/vite'

import { consola } from 'consola'
import { resolve } from 'pathe'
import Components from 'unplugin-vue-components/vite'

import Layouts from 'vite-plugin-vue-layouts'
import { groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import { customElements } from '../constants'
import { createConfigPlugin } from './extendConfig'
import { createMarkdownPlugin } from './markdown'
import { getGlobalTitleCollector } from './markdown/plugins/markdown-it/titleCollector'

import { createFixPlugins } from './patchTransform'
import { createClientSetupPlugin } from './setupClient'
import { createUnocssPlugin } from './unocss'

import { createValaxyPlugin } from './valaxy'
import { createRouterPlugin } from './vueRouter'

export async function ViteValaxyPlugins(
  valaxyApp: ValaxyNode,
  serverOptions: ValaxyServerOptions = {},
): Promise<(PluginOption | PluginOption[])[]> {
  const { options } = valaxyApp
  const { roots, config: valaxyConfig } = options

  const MarkdownPlugin = await createMarkdownPlugin(options)
  const ValaxyPlugin = await createValaxyPlugin(options, serverOptions)

  /**
   * for unplugin-vue-components
   */
  const componentsDirs = roots
    .map(root => `${root}/components`)
    .concat(['src/components', 'components'])

  // if (valaxyApp.options.mode === 'dev') {
  //   const devtoolsDir = path.dirname(await resolveImportPath('@valaxyjs/devtools/package.json'))
  //   const devtoolsComponentsDir = path.resolve(devtoolsDir, 'src/client/components')
  //   componentsDirs.push(devtoolsComponentsDir)

  //   const { componentsDir } = await import('@advjs/gui/node')
  //   componentsDirs.push(componentsDir)
  // }

  const vuePlugin = await import('@vitejs/plugin-vue').then(r =>
    r.default({
      include: /\.(?:vue|md)$/,
      exclude: [],
      ...valaxyConfig.vue,
      template: {
        ...valaxyConfig.vue?.template,
        compilerOptions: {
          ...valaxyConfig.vue?.template?.compilerOptions,
          isCustomElement: (tag) => {
            let is = customElements.has(tag)
            valaxyConfig.vue?.isCustomElement?.forEach((fn) => {
              is = is || fn(tag)
            })
            return is
          },
        },
      },
    }),
  )

  const plugins: (PluginOption | PluginOption[])[] = [
    MarkdownPlugin,
    ValaxyPlugin,
    vuePlugin,
    createConfigPlugin(options),
    createClientSetupPlugin(options),

    UnheadVite(),

    // https://github.com/posva/unplugin-vue-router
    await createRouterPlugin(valaxyApp),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      layoutsDirs: roots.map(root => `${root}/layouts`),

      ...valaxyConfig.layouts,
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      extensions: ['vue', 'md'],

      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      /**
       * 默认排除 components/.exclude
       * `/[\\/]node_modules[\\/]/, ` 不要排除 node_modules/valaxy/client/components 下的组件
       */
      exclude: [/[\\/]\.git[\\/]/, /[\\/]\.exclude[\\/]/],

      // allow override
      allowOverrides: true,
      /**
       * override: user -> theme -> client
       *
       * latter override former
       */
      dirs: componentsDirs,
      dts: resolve(options.tempDir, 'components.d.ts'),

      ...valaxyConfig.components,
    }),

    // https://github.com/antfu/unocss
    // UnocssPlugin,
    await createUnocssPlugin(options),

    // ...MarkdownPlugin,

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: roots.map(root => `${root}/locales/**`),
    }),

    createFixPlugins(options),
  ]

  if (valaxyConfig.visualizer) {
    try {
      const visualizer = (await import('rollup-plugin-visualizer')).visualizer
      plugins.push(
        visualizer({
          open: true,
          gzipSize: true,
          ...valaxyConfig.visualizer,
        }),
      )
    }
    catch (e) {
      console.error(e)
      consola.error('Failed to load rollup-plugin-visualizer')
      consola.error('Please install `rollup-plugin-visualizer` to enable the feature')
      // eslint-disable-next-line no-console
      console.log()
      consola.info('pnpm add -D rollup-plugin-visualizer')
      // eslint-disable-next-line no-console
      console.log()
    }
  }

  const builtinCustomIcon = {
    nodejs: 'vscode-icons:file-type-node',
    playwright: 'vscode-icons:file-type-playwright',
    typedoc: 'vscode-icons:file-type-typedoc',
    eslint: 'vscode-icons:file-type-eslint',
  }

  let cachedGroupIconsCSS: string | null = null

  // Create a custom plugin that intercepts the virtual CSS generation
  const dynamicGroupIconPlugin: PluginOption = {
    name: 'vitepress-plugin-group-icons',
    enforce: 'post' as const,

    configureServer(server: ViteDevServer) {
      // Watch for markdown file changes to invalidate the virtual module
      const markdownGlobs = roots.map(root => `${root}/**/*.md`)
      server.watcher.add(markdownGlobs)

      server.watcher.on('change', (file: string) => {
        if (file.endsWith('.md')) {
          // Clear cache and invalidate the virtual module when markdown files change
          cachedGroupIconsCSS = null
          const module = server.moduleGraph.getModuleById('\0virtual:group-icons.css')
          if (module) {
            server.reloadModule(module)
          }
        }
      })
    },

    resolveId(id: string) {
      if (id === 'virtual:group-icons.css') {
        return '\0virtual:group-icons.css'
      }
      return undefined
    },

    async load(id: string) {
      if (id === '\0virtual:group-icons.css') {
        // Return cached CSS if available (for build mode after generateBundle)
        if (cachedGroupIconsCSS !== null) {
          return cachedGroupIconsCSS
        }

        // For dev mode or initial build, generate with current titles
        const codeBlockTitles = getGlobalTitleCollector()

        // Create the original plugin with dynamic titles
        const originalPlugin = groupIconVitePlugin({
          customIcon: {
            ...builtinCustomIcon,
            ...valaxyConfig.groupIcons?.customIcon,
          },
          defaultLabels: [
            ...valaxyConfig.groupIcons?.defaultLabels || [],
            ...Object.keys(builtinCustomIcon),
            ...Object.keys(valaxyConfig.groupIcons?.customIcon || {}),
            ...Array.from(codeBlockTitles),
          ],
        })

        // Call the original plugin's load method
        if (originalPlugin && typeof originalPlugin === 'object' && 'load' in originalPlugin) {
          const css = (originalPlugin as any).load(id)
          return css
        }

        return ''
      }
      return undefined
    },

    // In build mode, regenerate the CSS after all markdown files have been processed
    generateBundle() {
      if (this.meta.rollupVersion) { // Build mode only
        // At this point, all markdown files should have been processed
        const codeBlockTitles = getGlobalTitleCollector()

        // Generate the final CSS with all collected titles
        const originalPlugin = groupIconVitePlugin({
          customIcon: {
            ...builtinCustomIcon,
            ...valaxyConfig.groupIcons?.customIcon,
          },
          defaultLabels: [
            ...valaxyConfig.groupIcons?.defaultLabels || [],
            ...Object.keys(builtinCustomIcon),
            ...Object.keys(valaxyConfig.groupIcons?.customIcon || {}),
            ...Array.from(codeBlockTitles),
          ],
        })

        // Cache the final CSS
        if (originalPlugin && typeof originalPlugin === 'object' && 'load' in originalPlugin) {
          cachedGroupIconsCSS = (originalPlugin as any).load('\0virtual:group-icons.css')
        }
      }
    },
  }

  plugins.push(dynamicGroupIconPlugin)
  return plugins
}
