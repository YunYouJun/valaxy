import type { HtmlTagDescriptor, Plugin } from 'vite'
import type { CdnModule, ResolvedValaxyOptions } from '../types'

const CDN_MODULE_PREFIX = '\0valaxy-cdn:'

// https://tc39.es/ecma262/#prod-IdentifierName
const VALID_JS_IDENTIFIER_RE = /^[$_\p{ID_Start}][$\u200C\u200D\p{ID_Continue}]*$/u

// https://tc39.es/ecma262/#sec-keywords-and-reserved-words
const JS_RESERVED_WORDS = new Set([
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  // strict mode reserved
  'let',
  'static',
  'implements',
  'interface',
  'package',
  'private',
  'protected',
  'public',
  'yield',
  // contextual keywords that cannot be used as export const bindings
  'await',
  // strict mode restricted identifiers (ES modules are always strict)
  'eval',
  'arguments',
])

/**
 * Generate virtual module code that re-exports from a CDN global variable.
 * exported for testing
 */
export function generateCdnModuleCode(mod: CdnModule): string {
  const globalKey = JSON.stringify(mod.global)
  const lines = [
    `const g = window[${globalKey}]`,
    `export default g`,
  ]

  if (mod.exports) {
    const seen = new Set<string>()
    for (const name of mod.exports) {
      if (seen.has(name))
        continue
      seen.add(name)
      if (!VALID_JS_IDENTIFIER_RE.test(name) || JS_RESERVED_WORDS.has(name)) {
        throw new Error(
          `[valaxy:cdn] Invalid export name ${JSON.stringify(name)} `
          + `in CDN module ${JSON.stringify(mod.name)}. `
          + `Export names must be valid JavaScript identifiers and not reserved words.`,
        )
      }
      lines.push(`export const ${name} = g[${JSON.stringify(name)}]`)
    }
  }

  return lines.join('\n')
}

/**
 * Create a Vite plugin that externalizes specified modules to CDN.
 *
 * During build, imports of configured packages are replaced with
 * virtual modules that reference global variables loaded from CDN scripts.
 * `<script>` and `<link>` tags are injected into the HTML.
 *
 * Only applies during `valaxy build` (client bundle), not in dev or SSR.
 *
 * @experimental
 * @see https://github.com/YunYouJun/valaxy/issues/604
 */
export function createCdnPlugin(options: ResolvedValaxyOptions): Plugin | null {
  const rawModules = options.config.cdn?.modules || []
  if (rawModules.length === 0)
    return null

  // Deduplicate by name, last entry wins (consistent with Map behavior)
  const cdnMap = new Map(rawModules.map(m => [m.name, m]))
  const cdnModules = [...cdnMap.values()]

  return {
    name: 'valaxy:cdn',
    enforce: 'pre',
    apply: 'build',

    resolveId(source, _importer, resolveOptions) {
      // Skip CDN rewriting during SSR so the server bundle uses the real package
      if (resolveOptions?.ssr)
        return
      if (cdnMap.has(source))
        return CDN_MODULE_PREFIX + source
    },

    load(id, loadOptions) {
      // Do not provide browser-only virtual modules during SSR
      if (loadOptions?.ssr)
        return
      if (!id.startsWith(CDN_MODULE_PREFIX))
        return
      const name = id.slice(CDN_MODULE_PREFIX.length)
      const mod = cdnMap.get(name)
      if (!mod)
        return
      return generateCdnModuleCode(mod)
    },

    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = []

      for (const mod of cdnModules) {
        // Inject CSS before script to avoid unstyled content flash
        if (mod.css) {
          tags.push({
            tag: 'link',
            attrs: {
              rel: 'stylesheet',
              href: mod.css,
              crossorigin: 'anonymous',
            },
            injectTo: 'head-prepend',
          })
        }

        tags.push({
          tag: 'script',
          attrs: {
            src: mod.url,
            crossorigin: 'anonymous',
          },
          injectTo: 'head-prepend',
        })
      }

      return tags
    },
  }
}
