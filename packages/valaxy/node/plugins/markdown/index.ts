import type { Header } from '@valaxyjs/utils'

import type { MarkdownItAsync } from 'markdown-it-async'
import type { ResolvedValaxyOptions } from '../../options'
import { createMarkdownItAsync } from 'markdown-it-async'

import { highlight } from './plugins/highlight'
import { defaultCodeTheme, setupMarkdownPlugins } from './setup'

export * from './env'
export * from './setup'
export * from './transform'

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}

export async function createMarkdownRenderer(options?: ResolvedValaxyOptions): Promise<MarkdownItAsync> {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  const md = createMarkdownItAsync({
    html: true,
    linkify: true,
    highlight: await highlight(theme, mdOptions),
    ...mdOptions.options,
  })

  md.linkify.set({ fuzzyLink: false })

  await setupMarkdownPlugins(md, options)
  return md
}
