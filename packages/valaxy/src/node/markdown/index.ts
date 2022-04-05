import type MarkdownIt from 'markdown-it'

import Anchor from 'markdown-it-anchor'
import Emoji from 'markdown-it-emoji'
import Prism from 'markdown-it-prism'
import LinkAttributes from 'markdown-it-link-attributes'
import TOC from 'markdown-it-table-of-contents'

import type { KatexOptions } from 'katex'
import Katex from '../markdown/markdown-it-katex'
import { containerPlugin } from '../markdown/markdown-it-container'
import { headingPlugin } from '../markdown/headings'
import { slugify } from './slugify'
import { parseHeader } from './parseHeader'

export interface Header {
  level: number
  title: string
  slug: string
}

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}
export interface MarkdownRenderer extends MarkdownIt {
  __data: MarkdownParsedData
}

export interface MarkdownOptions extends MarkdownIt.Options {
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: Anchor.AnchorOptions['permalink']
  }
  // https://github.com/Oktavilla/markdown-it-table-of-contents
  toc?: any
  katex?: KatexOptions
}

export function setupMarkdownPlugins(md: MarkdownIt, mdOptions: MarkdownOptions = {}) {
  md
    .use(containerPlugin)
    .use(headingPlugin)
  // https://prismjs.com/
  md.use(Prism)
  md.use(LinkAttributes, {
    matcher: (link: string) => /^https?:\/\//.test(link),
    attrs: {
      target: '_blank',
      rel: 'noopener',
    },
  })
  md.use(Katex, mdOptions.katex)
    .use(Anchor, {
      slugify,
      permalink: Anchor.permalink.ariaHidden({}),
    })
    .use(TOC, {
      slugify,
      includeLevel: [2, 3, 4],
      format: parseHeader,
      ...mdOptions.toc,
    })
    .use(Emoji)

  const originalRender = md.render
  md.render = (...args) => {
    (md as MarkdownRenderer).__data = {}
    return originalRender.call(md, ...args)
  }

  return md as MarkdownRenderer
}
