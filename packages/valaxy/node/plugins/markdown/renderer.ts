import type { MarkdownExit } from 'markdown-exit'
import type { MarkdownItOptions } from 'markdown-it'
import { createMarkdownExit } from 'markdown-exit'

/**
 * The Markdown renderer used by every Valaxy compile path.
 *
 * Keep the concrete parser behind this module so page compilation, excerpts,
 * search, and RSS share the same async rendering semantics.
 */
export type MarkdownRenderer = MarkdownExit
export interface MarkdownRendererOptions extends Omit<MarkdownItOptions, 'highlight'> {
  highlight?: ((str: string, lang: string, attrs: string) => string | Promise<string>) | null
}

export function createMarkdownEngine(options?: MarkdownRendererOptions): MarkdownRenderer {
  return createMarkdownExit(options)
}
