import type { EditableTreeNode } from 'vue-router/unplugin'
import { realpath } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'pathe'

export interface EditorRoute {
  /** Final Vue Router path without the Vite base; preserve filename encoding. */
  path: string
  dynamic: boolean
}

/** One snapshot per Vite pipeline, populated after the actual router hooks. */
export class EditorRoutes {
  private routes?: Map<string, EditorRoute[]>
  private sources = new Map<string, string>()
  private changed = new Map<string, { revision: number, running: boolean }>()
  private revision = 0

  begin(file: string) {
    const key = resolve(file)
    const change = { revision: ++this.revision, running: true }
    this.changed.set(key, change)
    return () => {
      change.running = false
    }
  }

  async update(tree: EditableTreeNode) {
    const completed = [...this.changed].filter(([, change]) => !change.running)
    const routes = new Map<string, EditorRoute[]>()
    const entries: { file: string, route: EditorRoute }[] = []
    for (const route of tree) {
      for (const file of route.components.values())
        entries.push({ file: resolve(file), route: { path: route.fullPath, dynamic: route.params.length > 0 } })
    }
    const sources = new Map<string, string>()
    await Promise.all([...new Set(entries.map(entry => entry.file))].map(async (file) => {
      try {
        const cached = !this.changed.has(file) && this.sources.get(file)
        sources.set(file, cached || (await realpath(file)).replaceAll('\\', '/'))
      }
      catch {}
    }))
    for (const { file, route } of entries) {
      const key = sources.get(file)
      if (!key)
        continue
      const matches = routes.get(key) || []
      if (!matches.some(entry => entry.path === route.path))
        matches.push(route)
      routes.set(key, matches)
    }
    this.routes = routes
    this.sources = sources
    for (const [file, change] of completed) {
      if (this.changed.get(file)?.revision === change.revision)
        this.changed.delete(file)
    }
  }

  async resolve(root: string, file: unknown) {
    if (typeof file !== 'string' || !file.endsWith('.md') || isAbsolute(file)
      || file.includes('\\') || file.includes('\0') || file.split('/').some(part => !part || part === '.' || part === '..')) {
      throw new Error('invalid-file')
    }
    const absolute = resolve(root, file)
    let canonical: string
    try {
      const [realRoot, realFile] = await Promise.all([realpath(root), realpath(absolute)])
      const child = relative(realRoot, realFile)
      if (child === '..' || child.startsWith('../') || isAbsolute(child))
        throw new Error('invalid-file')
      canonical = realFile.replaceAll('\\', '/')
    }
    catch (error) {
      if (['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code || ''))
        return { status: 'not-found' as const, routes: [] }
      throw error
    }
    if (!this.routes)
      return { status: 'pending' as const, routes: [] }
    for (const source of this.changed.keys()) {
      if (source === absolute || source === canonical || this.sources.get(source) === canonical)
        return { status: 'pending' as const, routes: [] }
    }
    const routes = this.routes.get(canonical) || []
    return { status: routes.length ? 'resolved' as const : 'not-found' as const, routes }
  }
}
