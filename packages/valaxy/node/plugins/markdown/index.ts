import type { Header } from '@valaxyjs/utils'

import type { MarkdownItAsync } from 'markdown-it-async'
import type { ResolvedValaxyOptions } from '../../types'
import { createMarkdownItAsync } from 'markdown-it-async'
import { logger } from '../../logger'

import { highlight as createHighlighter } from './plugins/highlight'
import { defaultCodeTheme, setupMarkdownPlugins } from './setup'

export * from './env'
export * from './setup'
export * from './transform'

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}

let md: MarkdownItAsync | undefined
let _disposeHighlighter: (() => void) | undefined

export function disposePreviewMdItInstance() {
  if (md) {
    md = undefined
    _disposeHighlighter?.()
  }
}

export async function createMarkdownRenderer(options?: ResolvedValaxyOptions): Promise<MarkdownItAsync> {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  const [highlight, dispose] = mdOptions.highlight
    ? [mdOptions.highlight, () => {}]
    : await createHighlighter(theme, mdOptions, logger)

  _disposeHighlighter = dispose

  const md = createMarkdownItAsync({
    html: true,
    linkify: true,
    highlight,
    ...mdOptions.options,
  })

  md.linkify.set({ fuzzyLink: false })

  await setupMarkdownPlugins(md, options)
  return md
}
