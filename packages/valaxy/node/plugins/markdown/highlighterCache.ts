import type { Logger } from 'vite'
import type { MarkdownOptions, ThemeOptions } from './types'
import { highlight as createHighlighter } from './plugins/highlight'

type HighlightFn = (str: string, lang: string, attrs: string) => Promise<string>

interface HighlighterResource {
  highlight: HighlightFn
  dispose: () => void
}

interface HighlighterEntry {
  promise: Promise<HighlighterResource>
  resource?: HighlighterResource
  refCount: number
  disposed: boolean
}

// A Shiki instance is only safe to share when every option that affects it is
// the same. Resolved Valaxy pipelines reuse these option objects, so identity
// keys share work within one configuration while isolating concurrent builds
// with different configurations.
const highlighterCache = new Map<ThemeOptions, Map<MarkdownOptions, HighlighterEntry>>()

function deleteEntry(theme: ThemeOptions, mdOptions: MarkdownOptions, entry: HighlighterEntry) {
  const themeCache = highlighterCache.get(theme)
  if (themeCache?.get(mdOptions) !== entry)
    return

  themeCache.delete(mdOptions)
  if (!themeCache.size)
    highlighterCache.delete(theme)
}

function disposeEntry(theme: ThemeOptions, mdOptions: MarkdownOptions, entry: HighlighterEntry) {
  if (entry.disposed)
    return

  entry.disposed = true
  deleteEntry(theme, mdOptions, entry)

  if (entry.resource) {
    entry.resource.dispose()
  }
  else {
    // Force-disposal can race with highlighter initialisation during shutdown.
    // Dispose as soon as the in-flight factory settles.
    void entry.promise.then(resource => resource.dispose(), () => {})
  }
}

/**
 * Get a Shiki highlighter shared by callers with the same configuration.
 * Call the returned one-shot release function when done. The underlying
 * instance is disposed when all references to that configuration are released.
 */
export async function getSharedHighlighter(
  theme: ThemeOptions,
  mdOptions: MarkdownOptions,
  logger: Pick<Logger, 'warn'>,
): Promise<[HighlightFn, () => void]> {
  let themeCache = highlighterCache.get(theme)
  if (!themeCache) {
    themeCache = new Map()
    highlighterCache.set(theme, themeCache)
  }

  let entry = themeCache.get(mdOptions)
  if (!entry) {
    const promise = createHighlighter(theme, mdOptions, logger)
      .then(([highlight, dispose]) => ({ highlight, dispose }))
    entry = {
      promise,
      refCount: 0,
      disposed: false,
    }
    themeCache.set(mdOptions, entry)
  }

  entry.refCount++

  let resource: HighlighterResource
  try {
    resource = await entry.promise
    entry.resource = resource
  }
  catch (error) {
    entry.refCount--
    deleteEntry(theme, mdOptions, entry)
    throw error
  }

  // Guard against double-release: each call gets a one-shot release function.
  let released = false
  const release = () => {
    if (released)
      return
    released = true
    entry.refCount--
    if (entry.refCount <= 0)
      disposeEntry(theme, mdOptions, entry)
  }
  return [resource.highlight, release]
}

/**
 * Force-dispose every cached highlighter (e.g. during process shutdown).
 */
export function disposeSharedHighlighter() {
  for (const [theme, themeCache] of highlighterCache) {
    for (const [mdOptions, entry] of themeCache)
      disposeEntry(theme, mdOptions, entry)
  }
  highlighterCache.clear()
}
