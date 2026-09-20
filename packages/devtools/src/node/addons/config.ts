import { generateCode, parseModule } from 'magicast'

function walk(node: unknown, visit: (node: Record<string, unknown>) => void) {
  if (!node || typeof node !== 'object')
    return
  if (Array.isArray(node)) {
    node.forEach(child => walk(child, visit))
    return
  }
  const value = node as Record<string, unknown>
  if (typeof value.type !== 'string')
    return
  visit(value)
  for (const [key, child] of Object.entries(value)) {
    if (!['loc', 'tokens', 'comments', 'original', 'leadingComments', 'trailingComments'].includes(key))
      walk(child, visit)
  }
}

/** Remove only statically identifiable addon declarations; never evaluate config. */
export function removeAddonFromConfig(source: string, name: string): string {
  const mod = parseModule(source)
  const imports = mod.imports.$items.filter(item => item.from === name)
  const bindings = new Set(imports.map(item => item.local))
  const exported = mod.exports.default
  const value = exported?.$type === 'function-call' ? exported.$args[0] : exported
  if (!value || value.$type !== 'object')
    throw new Error('This configuration is dynamic. Remove the addon references in your editor first.')
  const entries = value.addons
  if (entries != null && entries.$type !== 'array')
    throw new Error('The addons list is dynamic. Remove the addon references in your editor first.')
  const shortName = name.replace(/^valaxy-addon-/, '')
  let changed = imports.length > 0
  if (entries) {
    for (let index = entries.length - 1; index >= 0; index--) {
      const item = entries[index]
      const matches = typeof item === 'string'
        ? item === name || item === shortName
        : item?.$type === 'function-call'
          ? bindings.has(item.$callee)
          : item?.$type === 'object'
            ? item.name === name || item.name === shortName
            : false
      if (matches) {
        entries.splice(index, 1)
        changed = true
      }
    }
  }
  for (const item of imports)
    delete mod.imports[item.local]

  let remaining = false
  walk(mod.$ast, (node) => {
    if (node.type === 'Identifier' && bindings.has(String(node.name)))
      remaining = true
    if (['StringLiteral', 'Literal'].includes(String(node.type)) && typeof node.value === 'string' && (node.value === name || node.value.startsWith(`${name}/`)))
      remaining = true
  })
  if (remaining)
    throw new Error('This addon is referenced outside a simple addons entry. Remove those references in your editor first.')
  return changed ? generateCode(mod).code : source
}
