import type { Plugin } from 'vite'
import type { EditableTreeNode } from 'vue-router/unplugin'
import { createHash } from 'node:crypto'
import { statSync } from 'node:fs'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'
import { dirname, resolve } from 'pathe'
import { toAtFS } from '../utils/resolve'

/** Bridge serialized route excerpts to Vite's asset pipeline, without moving source files. */
export function createExcerptAssets() {
  const assets = new Map<string, { file: string, suffix: string }>()

  function register(html: string, source: string) {
    const output = new MagicString(html)
    let tag = ''
    const parser = new Parser({
      onopentagname(name) {
        tag = name
      },
      onattribute(name, value) {
        if (tag !== 'img' || name !== 'src' || !value || /^(?:\/|#|[a-z][\w+.-]*:)/i.test(value))
          return
        const [pathname] = value.split(/[?#]/)
        let file: string
        try {
          file = resolve(dirname(source), decodeURIComponent(pathname))
          if (!statSync(file).isFile())
            return
        }
        catch {
          return
        }
        const suffix = value.slice(pathname.length)
        const marker = `__VALAXY_EXCERPT_ASSET_${createHash('sha256').update(file).update('\0').update(suffix).digest('hex')}__`
        assets.set(marker, { file, suffix })
        // Parser offsets cover the complete attribute, including its closing quote.
        output.overwrite(parser.startIndex, parser.endIndex, `src="${marker}"`)
      },
    })
    parser.end(html)
    return output.toString()
  }

  function prepareRoutes(root: EditableTreeNode) {
    for (const route of root) {
      const source = route.components.get('default')
      if (source?.endsWith('.md') && typeof route.meta.excerpt === 'string')
        route.addToMeta({ excerpt: register(route.meta.excerpt, source) })
    }
  }

  const plugin: Plugin = {
    name: 'valaxy:excerpt-assets',
    transform(code, id) {
      if (id !== '\0vue-router/auto-routes')
        return
      const output = new MagicString(code)
      const imports: string[] = []
      for (const match of code.matchAll(/__VALAXY_EXCERPT_ASSET_[a-f0-9]{64}__/g)) {
        const asset = assets.get(match[0])
        if (!asset)
          continue
        const name = `__valaxy_excerpt_asset_${imports.length}`
        imports.push(`import ${name} from ${JSON.stringify(`${toAtFS(asset.file)}?url&no-inline`)}`)
        // Excerpts are JSON string literals. Splice in the URL as an HTML attribute,
        // preserving query/fragment suffixes without interpreting them as Vite flags.
        const url = `(${name}.replace(/\\?no-inline$/, '') + ${JSON.stringify(asset.suffix)}).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')`
        output.overwrite(match.index, match.index + match[0].length, `" + ${url} + "`)
      }
      if (!imports.length)
        return
      output.prepend(`${imports.join('\n')}\n`)
      return { code: output.toString(), map: output.generateMap({ hires: true }) }
    },
  }
  return { register, prepareRoutes, plugin }
}
