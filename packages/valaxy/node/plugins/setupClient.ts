import type { PluginOption } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { slash, uniq } from '@antfu/utils'
import { toAtFS } from '../utils'
import { warnMermaidMigration } from '../utils/mermaidMigration'

/**
 * setup client for defineAppSetup
 */
export function createClientSetupPlugin(options: ResolvedValaxyOptions): PluginOption {
  const { clientRoot, themeRoot, userRoot } = options
  if (!options.addons.some(addon => addon.name === 'valaxy-addon-mermaid' && addon.enable)) {
    const legacySetup = [themeRoot, userRoot].map(root => join(root, 'setup/mermaid.ts')).find(existsSync)
    if (legacySetup)
      warnMermaidMigration(options, legacySetup)
  }
  const setupEntry = slash(resolve(clientRoot, 'setup'))

  return {
    name: 'valaxy:setup',
    enforce: 'pre',
    async transform(code, id) {
      if (id.startsWith(setupEntry)) {
        const name = id.slice(setupEntry.length + 1).replace(/\?.*$/, '') // remove query
        const imports: string[] = []
        const injections: string[] = []

        const setups = uniq([
          themeRoot,
          userRoot,
        ]).map(i => join(i, 'setup', name))

        setups.forEach((path, idx) => {
          if (!existsSync(path))
            return

          imports.push(`import __n${idx} from '${toAtFS(path)}'`)

          let fn = `__n${idx}`

          if (/\binjection_return\b/.test(code))
            fn = `injection_return = ${fn}`
          if (/\binjection_arg\b/.test(code))
            fn += ('(injection_arg)')
          else
            fn += ('()')

          injections.push(
            `// ${path}`,
            fn,
          )
        })

        code = code.replace('/* __imports__ */', imports.join('\n'))
        code = code.replace('/* __injections__ */', injections.join('\n'))

        return code
      }

      return null
    },
  }
}
