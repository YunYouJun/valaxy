import type { MarkdownExit, MarkdownExitOptions } from 'markdown-exit'
import { createMarkdownExit } from 'markdown-exit'

/**
 * The Markdown renderer used by every Valaxy compile path.
 *
 * Keep the concrete parser behind this module so page compilation, excerpts,
 * search, and RSS share the same async rendering semantics.
 */
export type MarkdownRenderer = MarkdownExit
export interface MarkdownRendererOptions extends Omit<MarkdownExitOptions, 'highlight'> {
  highlight?: ((str: string, lang: string, attrs: string) => string | Promise<string>) | null
}

export function createMarkdownEngine(options?: MarkdownRendererOptions): MarkdownRenderer {
  return createMarkdownExit(options)
}
