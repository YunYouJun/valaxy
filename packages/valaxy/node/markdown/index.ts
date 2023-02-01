import MarkdownIt from 'markdown-it'

import type { IThemeRegistration } from 'shiki'

import anchorPlugin from 'markdown-it-anchor'
import attrsPlugin from 'markdown-it-attrs'
import emojiPlugin from 'markdown-it-emoji'
import TaskLists from 'markdown-it-task-lists'

import type { KatexOptions } from 'katex'

import { componentPlugin } from '@mdit-vue/plugin-component'
import {
  type FrontmatterPluginOptions,
  frontmatterPlugin,
} from '@mdit-vue/plugin-frontmatter'
import {
  type HeadersPluginOptions,
  headersPlugin,
} from '@mdit-vue/plugin-headers'
import { type SfcPluginOptions, sfcPlugin } from '@mdit-vue/plugin-sfc'
import { titlePlugin } from '@mdit-vue/plugin-title'
import { type TocPluginOptions, tocPlugin } from '@mdit-vue/plugin-toc'

import type { Header } from '../../types'
import Katex from './markdown-it/katex'
import { type Blocks, containerPlugin } from './markdown-it/container'
import { slugify } from './slugify'
import { highlight } from './highlight'
import { highlightLinePlugin, preWrapperPlugin } from './markdown-it/highlightLines'

import { linkPlugin } from './plugins/link'

// import { lineNumberPlugin } from "./plugins/lineNumbers";

export * from './env'
export type ThemeOptions =
  | IThemeRegistration
  | { light: IThemeRegistration; dark: IThemeRegistration }

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}

export type MarkdownRenderer = MarkdownIt

export interface MarkdownOptions {
  /**
   * markdown-it options
   */
  options?: MarkdownIt.Options
  /**
   * config markdown-it
   */
  config?: (md: MarkdownIt) => void
  anchor?: anchorPlugin.AnchorOptions
  attrs?: {
    leftDelimiter?: string
    rightDelimiter?: string
    allowedAttributes?: string[]
    disable?: boolean
  }
  // mdit-vue plugins
  frontmatter?: FrontmatterPluginOptions
  headers?: HeadersPluginOptions
  sfc?: SfcPluginOptions
  toc?: TocPluginOptions

  katex?: KatexOptions
  /**
   * shiki
   */
  theme?: ThemeOptions
  /**
   * Custom block configurations
   */
  blocks?: Blocks

  externalLinks?: Record<string, string>
}

export async function setupMarkdownPlugins(
  md: MarkdownIt,
  mdOptions: MarkdownOptions = {},
  isExcerpt = false,
  base = '/',
) {
  // custom plugins
  md.use(highlightLinePlugin)
    .use(preWrapperPlugin)
    .use(containerPlugin, mdOptions.blocks)
    .use(
      linkPlugin,
      {
        target: '_blank',
        rel: 'noreferrer',
        ...mdOptions.externalLinks,
      },
      base,
    )

  // conflict with {% %}
  // 3rd party plugins
  if (!mdOptions.attrs?.disable)
    md.use(attrsPlugin, mdOptions.attrs)

  // .use(lineNumberPlugin)

  md.use(Katex, mdOptions.katex)
  md.use(emojiPlugin)

  if (!isExcerpt) {
    md.use(anchorPlugin, {
      slugify,
      permalink: anchorPlugin.permalink.ariaHidden({}),
      ...mdOptions.anchor,
    })
  }

  // mdit-vue plugins
  md.use(componentPlugin)
    .use(frontmatterPlugin, {
      ...mdOptions.frontmatter,
    } as FrontmatterPluginOptions)
    .use(headersPlugin, {
      slugify,
      ...mdOptions.headers,
    } as HeadersPluginOptions)
    .use(sfcPlugin, {
      ...mdOptions.sfc,
    } as SfcPluginOptions)
    .use(titlePlugin)
    .use(tocPlugin, {
      slugify,
      ...mdOptions.toc,
    } as TocPluginOptions)

  md.use(TaskLists)

  if (mdOptions.config)
    mdOptions.config(md)

  // if (options.lineNumbers)
  //   md.use(lineNumberPlugin)

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
