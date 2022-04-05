import fs from 'fs'

import { join } from 'path'
import type { Plugin } from 'vite'
// import consola from 'consola'
import { resolveConfig } from '../config'
import type { ResolvedValaxyOptions, ValaxyServerOptions } from '../options'
import { toAtFS } from '../utils'
import { VALAXY_CONFIG_ID } from './valaxy'

/**
 * for /@valaxyjs/styles
 * @param roots
 * @returns
 */
function generateStyles(roots: string[]) {
  const imports: string[] = []

  for (const root of roots) {
    const styles: string[] = []

    const autoloadNames = ['index', 'css-vars']
    autoloadNames.forEach((name) => {
      styles.push(join(root, 'styles', `${name}.css`))
      styles.push(join(root, 'styles', `${name}.scss`))
    })

    for (const style of styles) {
      if (fs.existsSync(style))
        imports.push(`import "${toAtFS(style)}"`)
    }
  }
  return imports.join('\n')
}

function generateLocales(roots: string[]) {
  const imports: string[] = [
    'const messages = { "zh-CN": {}, en: {} }',
  ]
  const languages = ['zh-CN', 'en']

  roots.forEach((root, i) => {
    languages.forEach((lang) => {
      const langYml = `${root}/locales/${lang}.yml`
      if (fs.existsSync(langYml)) {
        const varName = lang.replace('-', '') + i
        imports.push(`import ${varName} from "${langYml}"`)
        imports.push(`Object.assign(messages['${lang}'], ${varName})`)
      }
    })
  })

  imports.push('export default messages')
  return imports.join('\n')
}

export function createValaxyPlugin(options: ResolvedValaxyOptions, serverOptions: ValaxyServerOptions = {}): Plugin {
  const valaxyPrefix = '/@valaxy'

  let valaxyConfig = options.config

  const roots = [options.clientRoot, options.themeRoot, options.userRoot]

  return {
    name: 'Valaxy',

    configureServer(server) {
      server.watcher.add([
        options.configFile,
        options.userRoot,
        options.themeRoot,
      ])
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

      // generate styles
      if (id === '/@valaxyjs/styles')
        return generateStyles(roots)

      if (id === '/@valaxyjs/locales')
        return generateLocales(roots)

      if (id.startsWith(valaxyPrefix))
        return ''
    },

    async handleHotUpdate(ctx) {
      // handle valaxy.config.ts hmr
      const { file, server } = ctx
      if (file !== options.configFile)
        return

      const { config } = await resolveConfig()

      serverOptions.onConfigReload?.(config, options.config)
      Object.assign(options.config, config)

      // if (config.base !== options.config.base)
      //   consola.warn('[valaxy]: config.base has changed. Please restart the dev server.')
      valaxyConfig = config

      const moduleIds = [`/${VALAXY_CONFIG_ID}`]
      const moduleEntries = [
        ...Array.from(moduleIds).map(id => server.moduleGraph.getModuleById(id)),
      ].filter(<T>(item: T): item is NonNullable<T> => !!item)

      return moduleEntries
    },
  }
}
