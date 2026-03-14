import type { HeadersPluginOptions } from '@mdit-vue/plugin-headers'

import type { SfcPluginOptions } from '@mdit-vue/plugin-sfc'
import type { TocPluginOptions } from '@mdit-vue/plugin-toc'

import type MarkdownIt from 'markdown-it'
import type { MarkdownItAsync } from 'markdown-it-async'
import type Token from 'markdown-it/lib/token.mjs'
import type { UserSiteConfig } from '../../../types'

import type { ResolvedValaxyOptions } from '../../types'
import type { ThemeOptions } from './types'

import {
  headersPlugin,
} from '@mdit-vue/plugin-headers'
import { sfcPlugin } from '@mdit-vue/plugin-sfc'
import { titlePlugin } from '@mdit-vue/plugin-title'
import { tocPlugin } from '@mdit-vue/plugin-toc'
import { slugify } from '@mdit-vue/shared'

import { cssI18nContainer } from 'css-i18n'
import anchorPlugin from 'markdown-it-anchor'

import attrsPlugin from 'markdown-it-attrs'
import { full as emojiPlugin } from 'markdown-it-emoji'
import footnotePlugin from 'markdown-it-footnote'
// https://www.npmjs.com/package/markdown-it-image-figures
import imageFigures from 'markdown-it-image-figures'

import TaskLists from 'markdown-it-task-lists'
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import { isKatexPluginNeeded, isMathJaxEnabled } from '../../config/valaxy'

import { isPromiseLike } from './plugins/async-utils'
import { linkPlugin } from './plugins/link'
import { containerPlugin } from './plugins/markdown-it/container'
import { footnoteTooltipPlugin } from './plugins/markdown-it/footnoteTooltip'

import { highlightLinePlugin } from './plugins/markdown-it/highlightLines'
import Katex from './plugins/markdown-it/katex'
import { lineNumberPlugin } from './plugins/markdown-it/lineNumbers'
import { preWrapperPlugin } from './plugins/markdown-it/preWrapper'
import { snippetPlugin } from './plugins/markdown-it/snippet'

export const defaultCodeTheme = { light: 'github-light', dark: 'github-dark' } as const as ThemeOptions

export async function setupMarkdownPlugins(
  md: MarkdownItAsync,
  options?: ResolvedValaxyOptions,
  // isExcerpt = false,
  base = '/',
) {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme
  const siteConfig: UserSiteConfig = options?.config.siteConfig || {}

  if (mdOptions.preConfig)
    mdOptions.preConfig(md)

  // custom plugins
  md.use(highlightLinePlugin)
    .use(preWrapperPlugin, { theme, siteConfig })
    .use(snippetPlugin, options?.userRoot)
    .use(containerPlugin, {
      languages: siteConfig.languages,
      ...mdOptions?.container,
      blocks: {
        ...mdOptions.blocks,
        ...mdOptions.container?.blocks,
      },
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
    .use(footnotePlugin)
    .use(footnoteTooltipPlugin)

  // if (!isExcerpt) {
  md.use(anchorPlugin, {
    slugify,
    getTokensText: (tokens) => {
      return tokens
        .filter(t => !['html_inline', 'emoji'].includes(t.type))
        .map(t => t.content)
        .join('')
    },
    permalink: anchorPlugin.permalink.linkInsideHeader({
      symbol: '&ZeroWidthSpace;',
      renderAttrs: (slug, state) => {
        // Find `heading_open` with the id identical to slug
        const idx = state.tokens.findIndex((token: Token) => {
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
  // }

  md
    .use(headersPlugin, {
      level: [2, 3, 4, 5, 6],
      slugify,
      ...(typeof mdOptions.headers === 'boolean' ? undefined : mdOptions.headers),
    } as HeadersPluginOptions)
    .use(sfcPlugin, {
      ...mdOptions.sfc,
    } as SfcPluginOptions)
    .use(titlePlugin)
    .use(tocPlugin, {
      slugify,
      ...mdOptions.toc,
    } as TocPluginOptions)

  // Math rendering: MathJax or KaTeX (mutually exclusive, MathJax takes priority)
  if (isMathJaxEnabled(options?.config)) {
    try {
      const mathPlugin = await import('markdown-it-mathjax3')
      const mathjaxPlugin = mathPlugin.default ?? mathPlugin
      mathjaxPlugin(md, {
        ...(mdOptions.mathjax || {}),
      })
      // Add v-pre to prevent Vue from processing MathJax SVG output
      const origMathInline = md.renderer.rules.math_inline!
      md.renderer.rules.math_inline = function (...args) {
        return origMathInline
          .apply(this, args)
          .replace(/^<mjx-container /, '<mjx-container v-pre ')
      }
      const origMathBlock = md.renderer.rules.math_block!
      md.renderer.rules.math_block = function (...args) {
        return origMathBlock
          .apply(this, args)
          .replace(/^<mjx-container /, '<mjx-container v-pre tabindex="0" ')
      }
    }
    catch {
      throw new Error(
        'You need to install `markdown-it-mathjax3` to use MathJax. '
        + 'Run: pnpm add markdown-it-mathjax3',
      )
    }
  }
  else if (isKatexPluginNeeded(options?.config)) {
    md.use(Katex, {
      katexOptions: mdOptions.katex,
      globalEnabled: options?.config?.features?.katex !== false,
    })
  }

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

  // Save the fence rule before groupIconMdPlugin wraps it
  const fenceBeforeGroupIcon = md.renderer.rules.fence!

  md.use(groupIconMdPlugin, {
    titleBar: { includeSnippet: true },
  })

  // Patch: groupIconMdPlugin wraps fence result in template literals,
  // which converts Promise<string> to "[object Promise]".
  // Re-implement its fence wrapper with async awareness.
  // markdown-exit's fence rule may return Promise<string> for async highlight.
  // Type-assert because markdown-it's RenderRule type doesn't account for this.
  md.renderer.rules.fence = ((...args: Parameters<typeof fenceBeforeGroupIcon>) => {
    const [tokens, idx] = args
    const token = tokens[idx]

    // Detect if we're inside a code-group
    let isOnCodeGroup = false
    for (let i = idx - 1; i >= 0; i--) {
      if (tokens[i].type === 'container_code-group_open') {
        isOnCodeGroup = true
        break
      }
      if (tokens[i].type === 'container_code-group_close')
        break
    }

    const title = token.info.match(/\[((?:[^[\]]|\[[^[\]]*\])*)\]/)
    const isIncludedSnippet = true // titleBar.includeSnippet

    if (!isOnCodeGroup && title && (!(token as any).src || isIncludedSnippet)) {
      const namedIconMatchRegex = /(?:^|\s)icon:([\w-]+)(?:\s|$)/
      const namedIconMatch = title[1].match(namedIconMatchRegex)
      const innerResult = fenceBeforeGroupIcon(...args)

      const wrap = (code: string) =>
        `<div class="vp-code-block-title">\n      <div class="vp-code-block-title-bar">\n          <span class="vp-code-block-title-text" data-title="${md.utils.escapeHtml(title![1])}">${namedIconMatch ? title![1].replace(namedIconMatch[0], '') : title![1]}</span>\n      </div>\n        ${code}\n      </div>\n      `

      return isPromiseLike(innerResult)
        ? (innerResult as unknown as Promise<string>).then(wrap)
        : wrap(innerResult as string)
    }

    // Non-title case: pass through
    return fenceBeforeGroupIcon(...args)
  }) as typeof fenceBeforeGroupIcon

  if (mdOptions.config)
    mdOptions.config(md)

  return md as MarkdownIt
}
