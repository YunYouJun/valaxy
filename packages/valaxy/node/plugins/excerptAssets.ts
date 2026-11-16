import type { Plugin } from 'vite'
import type { EditableTreeNode } from 'vue-router/unplugin'
import { statSync } from 'node:fs'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'
import { dirname, isAbsolute, resolve } from 'pathe'
import { toAtFS } from '../utils/resolve'

function resolveImage(src: string, source: string) {
  if (!src || /^(?:\/|#|[a-z][\w+.-]*:)/i.test(src))
    return

  const [pathname] = src.split(/[?#]/)
  let filename = pathname
  try {
    filename = decodeURIComponent(pathname)
  }
  catch {
    // A literal percent can also be part of a local filename.
  }
  if (isAbsolute(filename))
    return
  const file = resolve(dirname(source), filename)
  // Vite uses these delimiters to split module IDs. Leave the reference as-is.
  if (/[?#]/.test(file))
    return
  try {
    if (statSync(file, { throwIfNoEntry: false })?.isFile())
      return { file, suffix: src.slice(pathname.length) }
  }
  catch {
    // Unreadable or missing images keep their original src.
  }
}

function collectImageEdits(html: string, source: string, importImage: (file: string, forceFile: boolean) => string) {
  const edits: string[] = []
  let tag = ''
  const parser = new Parser({
    onopentagname(name) {
      tag = name
    },
    onattribute(name, src) {
      if (tag !== 'img' || name !== 'src')
        return
      const image = resolveImage(src, source)
      if (!image)
        return
      const { startIndex, endIndex } = parser
      const asset = importImage(image.file, !!image.suffix)
      edits.push(`[${startIndex}, ${endIndex}, ${JSON.stringify(html.slice(startIndex, endIndex))}, ${asset}, ${JSON.stringify(image.suffix)}]`)
    },
  })
  parser.end(html)
  return edits
}

/** Resolve HTML excerpts while generating routes, including on every router HMR update. */
export function createExcerptAssets() {
  let tree: EditableTreeNode | undefined

  const plugin: Plugin = {
    name: 'valaxy:excerpt-assets',
    transform(code, id) {
      if (id !== '\0vue-router/auto-routes' || !tree)
        return

      const imports = new Map<string, string>()
      function importImage(file: string, forceFile: boolean) {
        const request = `${toAtFS(file)}?url${forceFile ? '&no-inline' : ''}`
        const existing = imports.get(request)
        if (existing)
          return existing
        const name = `__valaxy_excerpt_asset_${imports.size}`
        imports.set(request, name)
        return name
      }

      const entries: string[] = []
      for (const route of tree) {
        const source = route.components.get('default')
        const { excerpt } = route.meta
        if (typeof route.name !== 'string' || !source?.endsWith('.md') || typeof excerpt !== 'string')
          continue
        const edits = collectImageEdits(excerpt, source, importImage)
        if (edits.length)
          entries.push(`[${JSON.stringify(route.name)}, [${edits.reverse().join(', ')}]]`)
      }
      if (!entries.length)
        return

      const output = new MagicString(code)
      output.prepend(`${Array.from(imports, ([request, name]) => `import ${name} from ${JSON.stringify(request)}`).join('\n')}\n`)
      // Apply edits to route records, without relying on how Vue Router serializes the HTML.
      output.append(`
{
  const editsByName = new Map([${entries.join(',\n')}])
  function updateExcerpts(records) {
    for (const route of records) {
      const edits = editsByName.get(route.name)
      let html = route.meta?.excerpt
      if (edits && typeof html === 'string') {
        for (const [start, end, original, url, suffix] of edits) {
          // A definePage() export can override the metadata supplied by the route tree.
          if (html.slice(start, end) !== original) continue
          const src = (suffix ? url.replace(/\\?no-inline$/, '') + suffix : url)
            .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
          html = html.slice(0, start) + 'src="' + src + '"' + html.slice(end)
        }
        route.meta.excerpt = html
      }
      if (route.children) updateExcerpts(route.children)
    }
  }
  updateExcerpts(routes)
}
`)
      return { code: output.toString(), map: output.generateMap({ hires: true }) }
    },
  }
  return {
    setRoutes(root: EditableTreeNode) {
      // The tree is live. Read the latest metadata after extendRoute, not in this delayed hook.
      tree = root
    },
    plugin,
  }
}
