import type { Logger } from 'vite'
import type { MarkdownOptions, ThemeOptions } from './types'
import { highlight as createHighlighter } from './plugins/highlight'

type HighlightFn = (str: string, lang: string, attrs: string) => Promise<string>

let _cachedHighlightFn: HighlightFn | undefined
let _cachedDispose: (() => void) | undefined
let _refCount = 0

/**
 * Get a shared Shiki highlighter instance.
 * Multiple callers share the same highlighter; call `releaseSharedHighlighter()`
 * when done. The underlying instance is disposed when all references are released.
 */
export async function getSharedHighlighter(
  theme: ThemeOptions,
  mdOptions: MarkdownOptions,
  logger: Pick<Logger, 'warn'>,
): Promise<[HighlightFn, () => void]> {
  if (!_cachedHighlightFn) {
    const [highlight, dispose] = await createHighlighter(theme, mdOptions, logger)
    _cachedHighlightFn = highlight
    _cachedDispose = dispose
    _refCount = 0
  }
  _refCount++
  return [_cachedHighlightFn, () => releaseSharedHighlighter()]
}

function releaseSharedHighlighter() {
  _refCount--
  if (_refCount <= 0) {
    disposeSharedHighlighter()
  }
}

/**
 * Force-dispose the shared highlighter (e.g. on build completion).
 */
export function disposeSharedHighlighter() {
  _cachedDispose?.()
  _cachedHighlightFn = undefined
  _cachedDispose = undefined
  _refCount = 0
}
