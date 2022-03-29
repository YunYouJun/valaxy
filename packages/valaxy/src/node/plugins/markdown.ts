import type MarkdownIt from 'markdown-it'

import Markdown, { link, meta } from 'vite-plugin-md'

import Anchor from 'markdown-it-anchor'
import Emoji from 'markdown-it-emoji'
import Prism from 'markdown-it-prism'
import LinkAttributes from 'markdown-it-link-attributes'
import TOC from 'markdown-it-table-of-contents'
import type { KatexOptions } from 'katex'
import type { ResolvedValaxyOptions } from '../options'
import Katex from '../markdown/markdown-it-katex'

export type ViteMdOptions = Parameters<typeof Markdown>[0]

export interface MarkdownOptions extends MarkdownIt.Options {
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: Anchor.AnchorOptions['permalink']
  }
  // https://github.com/Oktavilla/markdown-it-table-of-contents
  toc?: any
  katex?: KatexOptions
}

export const excerpt_separator = '<!-- more -->'

// https://github.com/antfu/vite-plugin-md
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createMarkdownPlugin(options: ResolvedValaxyOptions, mdOptions: MarkdownOptions = {}) {
  const defaultOptions: ViteMdOptions = {
    wrapperComponent: 'ValaxyMd',

    headEnabled: true,
    // frontmatter: true,

    excerpt: excerpt_separator,

    builders: [
      link(),
      meta(),
    ],

    markdownItSetup(md) {
      md.use(Anchor)
      // https://prismjs.com/
      md.use(Prism)
      md.use(LinkAttributes, {
        matcher: (link: string) => /^https?:\/\//.test(link),
        attrs: {
          target: '_blank',
          rel: 'noopener',
        },
      })
      md.use(TOC, {
        includeLevel: [2, 3, 4],
        listType: 'ol',
        ...mdOptions.toc,
      })

      md.use(Katex, mdOptions.katex)

      md.use(Emoji)

      if (mdOptions.config)
        mdOptions.config(md)

      // todo
      // katex
    },
  }
  return Markdown(Object.assign(defaultOptions, options.config.markdown))
}
