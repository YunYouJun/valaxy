import MarkdownIt from 'markdown-it'

import type { Theme } from 'shiki'

import Anchor from 'markdown-it-anchor'
import Emoji from 'markdown-it-emoji'
import LinkAttributes from 'markdown-it-link-attributes'
import TOC from 'markdown-it-table-of-contents'
import TaskLists from 'markdown-it-task-lists'
import attrs from 'markdown-it-attrs'

import type { KatexOptions } from 'katex'
import type { Header } from '../../types'
import Katex from './markdown-it/katex'
import { type Blocks, containerPlugin } from './markdown-it/container'
import { headingPlugin } from './markdown-it/headings'
import { slugify } from './slugify'
import { parseHeader } from './markdown-it/parseHeader'
import { highlight } from './highlight'
import { highlightLinePlugin, preWrapperPlugin } from './markdown-it/highlightLines'

export type ThemeOptions = Theme | { light: Theme; dark: Theme }

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}
export interface MarkdownRenderer extends MarkdownIt {
  __path: string
  __relativePath: string
  __data: MarkdownParsedData
}

export interface MarkdownOptions extends MarkdownIt.Options {
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: Anchor.AnchorOptions['permalink']
  }
  // https://github.com/Oktavilla/markdown-it-table-of-contents
  toc?: {
    includeLevel?: number[]
    [key: string]: any
  }
  katex?: KatexOptions
  /**
   * shiki
   */
  theme?: ThemeOptions
  /**
   * Custom block configurations
   */
  blocks?: Blocks
}

export async function setupMarkdownPlugins(md: MarkdownIt, mdOptions: MarkdownOptions = {}, isExcerpt = false) {
  md
    .use(highlightLinePlugin)
    .use(preWrapperPlugin)
    .use(containerPlugin, mdOptions.blocks)
    // conflict with {% %}
    .use(attrs)

  // generate toc in client
  if (!isExcerpt)
    md.use(headingPlugin, mdOptions?.toc?.includeLevel)
    // .use(lineNumberPlugin)
  // https://github.com/arve0/markdown-it-attrs
  // add classes
  md
    .use(LinkAttributes, {
      matcher: (link: string) => /^https?:\/\//.test(link),
      attrs: {
        target: '_blank',
        rel: 'noopener',
      },
    })
  md.use(Katex, mdOptions.katex)

  if (!isExcerpt) {
    md.use(Anchor, {
      slugify,
      permalink: Anchor.permalink.ariaHidden({}),
    })
      .use(TOC, {
        slugify,
        includeLevel: [2, 3, 4],
        format: parseHeader,
        ...mdOptions.toc,
      })
  }

  md.use(Emoji)
    .use(TaskLists)

  const originalRender = md.render
  md.render = (...args) => {
    (md as MarkdownRenderer).__data = {}
    return originalRender.call(md, ...args)
  }

  return md as MarkdownRenderer
}

export const createMarkdownRenderer = async (
  srcDir: string,
  options: MarkdownOptions = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  base = '/',
): Promise<MarkdownRenderer> => {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight: await highlight(options.theme),
    ...options,
  }) as MarkdownRenderer
  await setupMarkdownPlugins(md, options)
  return md
}
