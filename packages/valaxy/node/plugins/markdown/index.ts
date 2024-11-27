import type { Header } from '@valaxyjs/utils'
import type { ResolvedValaxyOptions } from '../../options'

import MarkdownIt from 'markdown-it'
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

export async function createMarkdownRenderer(options?: ResolvedValaxyOptions): Promise<MarkdownIt> {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight: await highlight(theme, mdOptions),
    ...mdOptions.options,
  }) as MarkdownIt

  md.linkify.set({ fuzzyLink: false })

  await setupMarkdownPlugins(md, options)
  return md
}
