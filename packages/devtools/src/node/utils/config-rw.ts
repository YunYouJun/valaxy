import fs from 'fs-extra'
import { generateCode, parseModule } from 'magicast'
import pathe from 'pathe'

export const DANGEROUS_FIELD_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function validateFieldPath(fieldPath: string): boolean {
  const parts = fieldPath.split('.')
  return parts.every(part => part.length > 0 && !DANGEROUS_FIELD_KEYS.has(part))
}

function assertInsideRoot(root: string, targetFile: string) {
  const relative = pathe.relative(root, targetFile)
  if (relative.startsWith('..') || pathe.isAbsolute(relative))
    throw new Error(`Config path is outside user root: ${targetFile}`)
}

/**
 * Get nested value from an object by dot-separated path
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object')
      return undefined
    current = current[part]
  }
  return current
}

/**
 * Set nested value on a magicast module export proxy by dot-separated path.
 * Creates intermediate objects as needed.
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (current[part] == null || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part]
  }
  current[parts.at(-1)!] = value
}

/**
 * Parse a TS config file with magicast, handling both default and named exports.
 * Returns the module and the export proxy to modify.
 */
async function parseConfigFile(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8')
  const mod = parseModule(content)
  return mod
}

/**
 * Deep-serialize a magicast proxy to a plain JS object.
 *
 * `JSON.stringify` silently drops function-call nodes (`$t(...)`, variable
 * references, etc.) because they have no own-enumerable keys.  This helper
 * walks the proxy tree and converts those nodes into a human-readable string
 * so the devtools UI always has *something* to display.
 */
function serializeProxy(value: any): any {
  // Guard: catch any magicast proxy errors (e.g. unsupported AST nodes
  // like MetaProperty from `import.meta.url`)
  try {
    if (value == null)
      return value

    // Primitive → return as-is
    if (typeof value !== 'object')
      return value

    // magicast function-call node: $t('key') → "$t('key')"
    if (value.$type === 'function-call') {
      const callee: string = value.$callee ?? ''
      const args: any[] = value.$args ?? []
      const serializedArgs = args.map((a: any) =>
        typeof a === 'string' ? `'${a}'` : JSON.stringify(a),
      ).join(', ')
      return `${callee}(${serializedArgs})`
    }

    // magicast identifier / other special nodes
    if (value.$type === 'identifier') {
      return String(value.$id ?? value)
    }

    // Any other unhandled magicast special node type → return placeholder
    // (skip 'object' which is the normal object proxy type)
    if (value.$type && value.$type !== 'object') {
      return `<${value.$type}>`
    }

    // Array
    if (Array.isArray(value)) {
      return value.map((item) => {
        try {
          return serializeProxy(item)
        }
        catch {
          return '<unsupported>'
        }
      })
    }

    // Plain object (or magicast object proxy)
    const result: Record<string, any> = {}
    for (const key of Object.keys(value)) {
      // Skip internal magicast meta keys
      if (key.startsWith('$'))
        continue
      try {
        result[key] = serializeProxy(value[key])
      }
      catch {
        // Skip properties that magicast can't proxy (MetaProperty, etc.)
        result[key] = '<unsupported expression>'
      }
    }
    return result
  }
  catch {
    return '<unsupported expression>'
  }
}

/**
 * Read the user's site.config.ts and valaxy.config.ts
 */
export async function readConfigs(userRoot: string): Promise<{
  siteConfig: Record<string, any>
  valaxyConfig: Record<string, any>
  themeConfig: Record<string, any>
  siteConfigExists: boolean
  valaxyConfigExists: boolean
  siteConfigPath: string
  valaxyConfigPath: string
}> {
  const siteConfigPath = pathe.resolve(userRoot, 'site.config.ts')
  const valaxyConfigPath = pathe.resolve(userRoot, 'valaxy.config.ts')

  let siteConfig: Record<string, any> = {}
  let valaxyConfig: Record<string, any> = {}
  let themeConfig: Record<string, any> = {}

  const siteConfigExists = await fs.pathExists(siteConfigPath)
  const valaxyConfigExists = await fs.pathExists(valaxyConfigPath)

  if (siteConfigExists) {
    try {
      const mod = await parseConfigFile(siteConfigPath)
      const defaultExport = mod.exports.default
      if (defaultExport && typeof defaultExport === 'object') {
        siteConfig = serializeProxy(defaultExport.$args?.[0] ?? defaultExport)
      }
    }
    catch (e) {
      console.error('[devtools] Failed to parse site.config.ts:', e)
    }
  }

  if (valaxyConfigExists) {
    try {
      const mod = await parseConfigFile(valaxyConfigPath)
      const defaultExport = mod.exports.default
      if (defaultExport && typeof defaultExport === 'object') {
        const configObj = defaultExport.$args?.[0] ?? defaultExport
        const raw = serializeProxy(configObj)
        // Separate themeConfig from the rest
        if (raw.themeConfig) {
          themeConfig = raw.themeConfig
          delete raw.themeConfig
        }
        // Separate siteConfig from valaxy config (if inline)
        if (raw.siteConfig) {
          delete raw.siteConfig
        }
        valaxyConfig = raw
      }
    }
    catch (e) {
      console.error('[devtools] Failed to parse valaxy.config.ts:', e)
    }
  }

  return {
    siteConfig,
    valaxyConfig,
    themeConfig,
    siteConfigExists,
    valaxyConfigExists,
    siteConfigPath,
    valaxyConfigPath,
  }
}

const SITE_CONFIG_TEMPLATE = `import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
})
`

const VALAXY_CONFIG_TEMPLATE = `import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
})
`

/**
 * Write a single config field value using magicast (AST-level modification).
 */
export async function writeConfigField(
  userRoot: string,
  configType: 'site' | 'valaxy' | 'theme',
  fieldPath: string,
  value: any,
): Promise<void> {
  if (!validateFieldPath(fieldPath)) {
    throw new Error(`Invalid field path: ${fieldPath}`)
  }

  const targetFile = configType === 'site'
    ? pathe.resolve(userRoot, 'site.config.ts')
    : pathe.resolve(userRoot, 'valaxy.config.ts')

  const template = configType === 'site'
    ? SITE_CONFIG_TEMPLATE
    : VALAXY_CONFIG_TEMPLATE

  assertInsideRoot(userRoot, targetFile)

  // Ensure file exists
  if (!await fs.pathExists(targetFile)) {
    await fs.writeFile(targetFile, template, 'utf-8')
  }

  const mod = await parseConfigFile(targetFile)

  // Get the config argument of the define* function call
  const defaultExport = mod.exports.default
  if (!defaultExport) {
    throw new Error(`No default export found in ${targetFile}`)
  }

  // The default export is a function call like defineSiteConfig({...})
  // magicast represents this as a proxy; we need to access the first argument
  const configObj = defaultExport.$args?.[0] ?? defaultExport

  if (configType === 'theme') {
    // For theme config, write to valaxy.config.ts -> themeConfig.xxx
    if (!configObj.themeConfig || typeof configObj.themeConfig !== 'object') {
      configObj.themeConfig = {}
    }
    setNestedValue(configObj.themeConfig, fieldPath, value)
  }
  else if (configType === 'valaxy') {
    setNestedValue(configObj, fieldPath, value)
  }
  else {
    // site config
    setNestedValue(configObj, fieldPath, value)
  }

  const { code } = generateCode(mod)
  await fs.writeFile(targetFile, code, 'utf-8')
}

/**
 * Read a single field value from config for verification.
 */
export async function readConfigField(
  userRoot: string,
  configType: 'site' | 'valaxy' | 'theme',
  fieldPath: string,
): Promise<any> {
  const configs = await readConfigs(userRoot)
  const source = configType === 'site'
    ? configs.siteConfig
    : configType === 'theme'
      ? configs.themeConfig
      : configs.valaxyConfig

  return getNestedValue(source, fieldPath)
}
