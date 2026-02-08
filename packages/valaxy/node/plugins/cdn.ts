import type { HtmlTagDescriptor, Plugin } from 'vite'
import type { CdnModule, ResolvedValaxyOptions } from '../types'

const CDN_MODULE_PREFIX = '\0valaxy-cdn:'

/**
 * Generate virtual module code that re-exports from a CDN global variable.
 */
function generateCdnModuleCode(mod: CdnModule): string {
  const lines = [
    `const g = window['${mod.global}']`,
    `export default g`,
  ]

  if (mod.exports) {
    for (const name of mod.exports)
      lines.push(`export const ${name} = g['${name}']`)
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
 * Only applies during `valaxy build`, not in dev mode.
 *
 * @experimental
 * @see https://github.com/YunYouJun/valaxy/issues/604
 */
export function createCdnPlugin(options: ResolvedValaxyOptions): Plugin | null {
  const cdnModules = options.config.cdn?.modules || []
  if (cdnModules.length === 0)
    return null

  const cdnMap = new Map(cdnModules.map(m => [m.name, m]))

  return {
    name: 'valaxy:cdn',
    enforce: 'pre',
    apply: 'build',

    resolveId(source) {
      if (cdnMap.has(source))
        return CDN_MODULE_PREFIX + source
    },

    load(id) {
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
        tags.push({
          tag: 'script',
          attrs: {
            src: mod.url,
            crossorigin: 'anonymous',
          },
          injectTo: 'head-prepend',
        })

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
      }

      return tags
    },
  }
}
