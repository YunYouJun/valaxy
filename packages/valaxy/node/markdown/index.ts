import MarkdownIt from 'markdown-it'

import type { Theme } from 'shiki'

import anchorPlugin from 'markdown-it-anchor'
import emojiPlugin from 'markdown-it-emoji'
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

export interface MarkdownOptions {
  /**
   * markdown-it options
   */
  options?: MarkdownIt.Options
  /**
   * config markdown-it
   */
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: anchorPlugin.AnchorOptions['permalink']
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
  md.use(emojiPlugin)

  if (!isExcerpt) {
    md.use(anchorPlugin, {
      slugify,
      permalink: anchorPlugin.permalink.ariaHidden({}),
      ...mdOptions.anchor,
    })
      .use(TOC, {
        slugify,
        includeLevel: [2, 3, 4],
        ...mdOptions.toc,
      })
  }

  md.use(TaskLists)

  const originalRender = md.render
  md.render = (...args) => {
    (md as MarkdownRenderer).__data = {}
    return originalRender.call(md, ...args)
  }

  if (mdOptions.config)
    mdOptions.config(md)

  return md as MarkdownRenderer
}

export const createMarkdownRenderer = async (
  mdOptions: MarkdownOptions = {},
): Promise<MarkdownRenderer> => {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight: await highlight(mdOptions.theme),
    ...mdOptions.options,
  }) as MarkdownRenderer
  await setupMarkdownPlugins(md, mdOptions)
  return md
}
