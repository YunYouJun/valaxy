import type { Header } from '@valaxyjs/utils'

import type { MarkdownItAsync } from 'markdown-it-async'
import type { ResolvedValaxyOptions } from '../../types'
import { createMarkdownItAsync } from 'markdown-it-async'
import { logger } from '../../logger'

import { getSharedHighlighter } from './highlighterCache'
import { defaultCodeTheme, setupMarkdownPlugins } from './setup'

export * from './env'
export * from './setup'
export * from './transform'

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}

let _disposeHighlighter: (() => void) | undefined

export function disposePreviewMdItInstance() {
  _disposeHighlighter?.()
  _disposeHighlighter = undefined
}

export async function createMarkdownRenderer(options?: ResolvedValaxyOptions): Promise<MarkdownItAsync> {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  const [highlight, dispose] = mdOptions.highlight
    ? [mdOptions.highlight, () => {}]
    : await getSharedHighlighter(theme, mdOptions, logger)

  _disposeHighlighter = dispose

  const md = createMarkdownItAsync({
    html: true,
    linkify: true,
    ...mdOptions.options,
    highlight,
  })

  md.linkify.set({ fuzzyLink: false })

  await setupMarkdownPlugins(md, options)
  return md
}

/**
 * Light markdown renderer without Shiki highlighter.
 * Used by localSearchPlugin where HTML output is stripped anyway,
 * saving ~20-50 MB of Shiki theme/grammar data.
 */
export async function createLightMarkdownRenderer(options?: ResolvedValaxyOptions): Promise<MarkdownItAsync> {
  const mdOptions = options?.config.markdown || {}

  // Define highlight separately to avoid circular type inference
  // (md referencing itself in its own initializer)
  const highlight = (str: string): string => {
    const escaped = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    return `<pre><code>${escaped}</code></pre>`
  }

  const md = createMarkdownItAsync({
    html: true,
    linkify: true,
    ...mdOptions.options,
    highlight,
  })

  md.linkify.set({ fuzzyLink: false })

  await setupMarkdownPlugins(md, options)
  return md
}
