import type { ResolvedConfig } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import { join } from 'pathe'
import Layouts from 'vite-plugin-vue-layouts-next'
import { babelParse } from 'vue/compiler-sfc'

/** Read the layout plugin's generated registry without importing any components. */
export async function resolveContentLayouts(options: ResolvedValaxyOptions): Promise<Set<string>> {
  const configured = options.config.layouts
  const dirs = configured?.layoutsDirs ?? options.roots.map(root => join(root, 'layouts'))
  const plugin = Layouts({
    ...configured,
    // Array form selects the server-side registry generator, including for one directory.
    layoutsDirs: Array.isArray(dirs) ? dirs : [dirs],
  })
  // This plugin's configResolved/load hooks only use root and the module id.
  const configure = plugin.configResolved as (config: ResolvedConfig) => void
  const load = plugin.load as (id: string) => Promise<{ code: string }>
  configure({ root: options.userRoot } as ResolvedConfig)
  const source = await load('/@vite-plugin-vue-layouts-next/generated-layouts')
  const ast = babelParse(source.code, { sourceType: 'module' })
  for (const statement of ast.program.body) {
    if (statement.type !== 'ExportNamedDeclaration' || statement.declaration?.type !== 'VariableDeclaration')
      continue
    for (const declaration of statement.declaration.declarations) {
      if (declaration.id.type !== 'Identifier' || declaration.id.name !== 'layouts' || declaration.init?.type !== 'ObjectExpression')
        continue
      return new Set(declaration.init.properties.flatMap(property => property.type === 'ObjectProperty' && property.key.type === 'StringLiteral' ? [property.key.value] : []))
    }
  }
  throw new Error('Layout registry was not generated')
}
