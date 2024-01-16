import MarkdownIt from 'markdown-it'

import anchorPlugin from 'markdown-it-anchor'
import attrsPlugin from 'markdown-it-attrs'

// @ts-expect-error wait @types/markdown-it-emoji update
import { full as emojiPlugin } from 'markdown-it-emoji'
import TaskLists from 'markdown-it-task-lists'

// https://www.npmjs.com/package/markdown-it-image-figures
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
import type { Header } from 'valaxy/types'
import type { ResolvedValaxyOptions } from '../options'
import Katex from './plugins/markdown-it/katex'
import { containerPlugin } from './plugins/markdown-it/container'
import { highlight } from './plugins/highlight'
import { highlightLinePlugin } from './plugins/markdown-it/highlightLines'

import { linkPlugin } from './plugins/link'
import { preWrapperPlugin } from './plugins/markdown-it/preWrapper'
import { lineNumberPlugin } from './plugins/markdown-it/lineNumbers'
import { snippetPlugin } from './plugins/markdown-it/snippet'

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
  options?: ResolvedValaxyOptions,
  isExcerpt = false,
  base = '/',
) {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme
  const siteConfig = options?.config.siteConfig || {}

  if (mdOptions.preConfig)
    mdOptions.preConfig(md)

  // mdit-vue plugins
  md.use(componentPlugin, { ...mdOptions.component })
  // custom plugins
  md.use(highlightLinePlugin)
    .use(preWrapperPlugin, { theme, siteConfig })
    .use(snippetPlugin, options?.userRoot)
    .use(containerPlugin, {
      ...mdOptions.blocks,
      theme,
    })
    .use(cssI18nContainer, {
      languages: options?.config.siteConfig.languages,
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

  // ref vitepress
  md.use(lineNumberPlugin, mdOptions.lineNumbers)

  // conflict with {% %}
  // 3rd party plugins
  if (!mdOptions.attrs?.disable)
    md.use(attrsPlugin, mdOptions.attrs)

  md.use(emojiPlugin)

  if (!isExcerpt) {
    md.use(anchorPlugin, {
      slugify,
      permalink: anchorPlugin.permalink.linkInsideHeader({
        symbol: '&ZeroWidthSpace;',
        renderAttrs: (slug, state) => {
        // Find `heading_open` with the id identical to slug
          const idx = state.tokens.findIndex((token) => {
            const attrs = token.attrs
            const id = attrs?.find(attr => attr[0] === 'id')
            return id && slug === id[1]
          })
          // Get the actual heading content
          const title = state.tokens[idx + 1].content
          return {
            'aria-label': `Permalink to "${title}"`,
          }
        },
      }),
      ...mdOptions.anchor,
    })
  }
  md.use(frontmatterPlugin, {
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
      ...mdOptions.toc,
    } as TocPluginOptions)

  md.use(Katex, mdOptions.katex)

  const vanillaLazyload = options?.config.siteConfig.vanillaLazyload || { enable: false }
  // markdown-it-image-figures
  md.use(imageFigures, {
    figcaption: true,
    // default web performance recommended settings
    lazy: true,
    async: true,

    // removeSrc and classes are required by vanilla-lazyload
    ...(vanillaLazyload.enable
      ? {
          lazy: true,
          async: true,
          classes: 'lazy',
          // when removeSrc, vite can not handle relative path
          // removeSrc in useVanillaLazyload onMounted
          // removeSrc: true,
        }
      : {}),

    ...mdOptions.imageFigures,
  })

  md.use(TaskLists)

  if (mdOptions.config)
    mdOptions.config(md)

  return md as MarkdownRenderer
}

export async function createMarkdownRenderer(options?: ResolvedValaxyOptions): Promise<MarkdownRenderer> {
  const mdOptions = options?.config.markdown || {}
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
