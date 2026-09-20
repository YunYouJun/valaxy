import type { StateManager, ValaxyFileInfo } from '../../app/state'
import type { MarkdownBase } from './base'
import type { MarkdownEnv } from './env'
import type { MarkdownRenderer } from './renderer'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import debug from 'debug'
import { LRUCache } from 'lru-cache'
import { createMarkdownBaseResolver } from './base'

/** Reuse parsed HTML across the two SSG bundles, after includes/user transforms. */
export function cacheMarkdownRender(md: MarkdownRenderer, state: StateManager, base: MarkdownBase, fileInfoFor: (env: MarkdownEnv) => ValaxyFileInfo | undefined) {
  const cache = new LRUCache<string, { html: string, env: MarkdownEnv, fileInfo?: ValaxyFileInfo, bytes: number }>({
    max: 2048,
    maxSize: 32 * 1024 * 1024,
    sizeCalculation: item => item.bytes,
  })
  const log = debug('valaxy:md')
  const getBase = createMarkdownBaseResolver(base)
  const render = md.renderAsync.bind(md)
  let active = true
  state.onDispose(() => {
    active = false
    cache.clear()
  })

  md.renderAsync = async (source, env: MarkdownEnv = {}) => {
    // unplugin-vue-markdown starts with { id }. Leave custom render calls with
    // other input state alone, since that state may affect a user's renderer.
    if (!active || !env.id || Object.keys(env).some(key => key !== 'id'))
      return render(source, env)
    const key = createHash('sha256').update(env.id).update('\0').update(getBase()).update('\0').update(source).digest('base64url')
    const cached = cache.get(key)
    if (cached) {
      const snapshot = structuredClone({ env: cached.env, fileInfo: cached.fileInfo })
      Object.assign(env, snapshot.env)
      if (snapshot.fileInfo)
        state.set(snapshot.fileInfo)
      log(`[parser cache hit] ${env.id}`)
      return cached.html
    }
    const html = await render(source, env)
    try {
      // A newer transform for the same id can finish while this renderer awaits
      // an async rule. Capture this environment's metadata, not the latest id.
      const snapshot = structuredClone({ env, fileInfo: fileInfoFor(env) })
      const bytes = Buffer.byteLength(html) + Buffer.byteLength(JSON.stringify(snapshot))
      cache.set(key, { html, ...snapshot, bytes })
    }
    catch {
      // Plugins may attach functions or cyclic/non-serializable state. Such
      // pages still render normally; only the optional cache is bypassed.
    }
    return html
  }
}
