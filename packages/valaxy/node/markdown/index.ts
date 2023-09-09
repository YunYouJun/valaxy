import MarkdownIt from 'markdown-it'

import anchorPlugin from 'markdown-it-anchor'
import attrsPlugin from 'markdown-it-attrs'
import emojiPlugin from 'markdown-it-emoji'
import TaskLists from 'markdown-it-task-lists'
import imageFigures from 'markdown-it-image-figures'

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

import { slugify } from '@mdit-vue/shared'
import { cssI18nContainer } from 'css-i18n'
import type { ResolvedValaxyOptions } from 'packages/valaxy/dist/node'
import type { Header } from '../../types'
import Katex from './plugins/markdown-it/katex'
import { containerPlugin } from './plugins/markdown-it/container'
import { highlight } from './plugins/highlight'
import { highlightLinePlugin } from './plugins/markdown-it/highlightLines'

import { linkPlugin } from './plugins/link'
import { preWrapperPlugin } from './plugins/markdown-it/preWrapper'

// import { lineNumberPlugin } from "./plugins/lineNumbers";

export * from './env'

export interface MarkdownParsedData {
  hoistedTags?: string[]
  links?: string[]
  headers?: Header[]
}

export type MarkdownRenderer = MarkdownIt

export const defaultCodeTheme = { light: 'github-light', dark: 'github-dark' }

export async function setupMarkdownPlugins(
  md: MarkdownIt,
  options: ResolvedValaxyOptions,
  isExcerpt = false,
  base = '/',
) {
  const mdOptions = options.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  // custom plugins
  md.use(highlightLinePlugin)
    .use(preWrapperPlugin, { theme })
    .use(containerPlugin, mdOptions.blocks)
    .use(cssI18nContainer, {
      languages: ['zh-CN', 'en'],
    })
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

  const vanillaLazyload = options.config.siteConfig.vanillaLazyload
  // markdown-it-image-figures
  md.use(imageFigures, {
    figcaption: true,
    // default web performance recommended settings
    lazy: true,
    async: true,

    // removeSrc and classes are required by vanilla-lazyload
    ...(vanillaLazyload.enable
      ? {
          lazy: false,
          async: false,
          removeSrc: true,
          classes: 'lazy',
        }
      : {}),

    ...mdOptions.imageFigures,
  })

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

export async function createMarkdownRenderer(options: ResolvedValaxyOptions): Promise<MarkdownRenderer> {
  const mdOptions = options.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight: await highlight(theme, mdOptions.languages, mdOptions.defaultHighlightLang),
    ...mdOptions.options,
  }) as MarkdownRenderer
  await setupMarkdownPlugins(md, options)
  return md
}
