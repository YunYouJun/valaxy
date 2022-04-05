import type MarkdownIt from 'markdown-it'

import Anchor from 'markdown-it-anchor'
import Emoji from 'markdown-it-emoji'
import LinkAttributes from 'markdown-it-link-attributes'
import TOC from 'markdown-it-table-of-contents'
import TaskLists from 'markdown-it-task-lists'
import attrs from 'markdown-it-attrs'

import type { KatexOptions } from 'katex'
import Katex from '../markdown/markdown-it-katex'
import { containerPlugin } from '../markdown/markdown-it-container'
import { headingPlugin } from '../markdown/headings'
import { slugify } from './slugify'
import { parseHeader } from './parseHeader'
import { highlight } from './highlight'
import { highlightLinePlugin, preWrapperPlugin } from './highlightLines'

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
  md.set({
    highlight,
  })
  md
    .use(highlightLinePlugin)
    .use(preWrapperPlugin)
    .use(containerPlugin)
    .use(headingPlugin)
    // .use(lineNumberPlugin)
  // https://github.com/arve0/markdown-it-attrs
  // add classes
  md.use(attrs)
    .use(LinkAttributes, {
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
    .use(TaskLists)

  const originalRender = md.render
  md.render = (...args) => {
    (md as MarkdownRenderer).__data = {}
    return originalRender.call(md, ...args)
  }

  return md as MarkdownRenderer
}
