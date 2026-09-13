import type { HeadersPluginOptions } from '@mdit-vue/plugin-headers'

import type { SfcPluginOptions } from '@mdit-vue/plugin-sfc'
import type { TocPluginOptions } from '@mdit-vue/plugin-toc'

import type { UserSiteConfig } from '../../../types'

import type { ResolvedValaxyOptions } from '../../types'
import type { MarkdownBase } from './base'
import type { MarkdownRenderer } from './renderer'
import type {
  MarkdownAnchorOptions,
  MarkdownAnchorPermalinkGenerator,
  MarkdownAnchorPermalinkOptions,
  ThemeOptions,
} from './types'

import { sfcPlugin } from '@mdit-vue/plugin-sfc'
import { tocPlugin } from '@mdit-vue/plugin-toc'
import { resolveHeadersFromTokens, resolveTitleFromToken, slugify } from '@mdit-vue/shared'

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

import { createMarkdownBaseResolver } from './base'
import { isPromiseLike, mapRenderResult } from './plugins/async-utils'
import { imagePlugin } from './plugins/image'
import { linkPlugin } from './plugins/link'
import { containerPlugin } from './plugins/markdown-it/container'
import { footnoteTooltipPlugin } from './plugins/markdown-it/footnoteTooltip'

import { highlightLinePlugin } from './plugins/markdown-it/highlightLines'
import Katex from './plugins/markdown-it/katex'
import { lineNumberPlugin } from './plugins/markdown-it/lineNumbers'
import { preWrapperPlugin } from './plugins/markdown-it/preWrapper'
import { snippetPlugin } from './plugins/markdown-it/snippet'

export const defaultCodeTheme = { light: 'github-light', dark: 'github-dark' } as const as ThemeOptions

// These plugins only use markdown-it's stable structural plugin interface.
// Their published declarations target markdown-it, while Valaxy's runtime uses
// the compatible MarkdownExit implementation for async rendering.
const sfcPluginCompat = sfcPlugin as unknown as (md: MarkdownRenderer, options: SfcPluginOptions) => void
const tocPluginCompat = tocPlugin as unknown as (md: MarkdownRenderer, options: TocPluginOptions) => void
const emojiPluginCompat = emojiPlugin as unknown as (md: MarkdownRenderer) => void
const footnotePluginCompat = footnotePlugin as unknown as (md: MarkdownRenderer) => void
const anchorPluginCompat = anchorPlugin as unknown as {
  (md: MarkdownRenderer, options?: MarkdownAnchorOptions): void
  permalink: {
    linkInsideHeader: (options?: MarkdownAnchorPermalinkOptions) => MarkdownAnchorPermalinkGenerator
  }
}

export function setupMarkdownPageMetadata(md: MarkdownRenderer, options?: ResolvedValaxyOptions) {
  const mdOptions = options?.config.markdown || {}
  const headersOptions: HeadersPluginOptions = typeof mdOptions.headers === 'boolean'
    ? {}
    : mdOptions.headers || {}
  const {
    level = [2, 3, 4, 5, 6],
    shouldAllowNested = false,
    slugify: headersSlugify = slugify,
    format,
  } = headersOptions

  // The @mdit-vue headers and title plugins monkey-patch renderer.render().
  // markdown-exit honors sync renderer wrappers by routing renderAsync() back
  // through render(), where an async fence/highlighter rule cannot be awaited.
  // Extract the same metadata in the core pipeline instead. Callers register
  // this rule after user plugins so it observes the final parsed token stream.
  md.core.ruler.push('valaxy_page_metadata', (state) => {
    type HeadersTokens = Parameters<typeof resolveHeadersFromTokens>[0]
    type TitleToken = Parameters<typeof resolveTitleFromToken>[0]
    const tokens = state.tokens as unknown as HeadersTokens

    state.env.headers = resolveHeadersFromTokens(tokens, {
      level,
      shouldAllowHtml: false,
      shouldAllowNested,
      shouldEscapeText: false,
      slugify: headersSlugify,
      format,
    })

    const titleTokenIndex = state.tokens.findIndex(token => token.tag === 'h1')
    state.env.title = titleTokenIndex > -1
      ? resolveTitleFromToken(state.tokens[titleTokenIndex + 1] as unknown as TitleToken, {
          shouldAllowHtml: false,
          shouldEscapeText: false,
        })
      : ''
  })
}

export async function setupMarkdownPlugins(
  md: MarkdownRenderer,
  options?: ResolvedValaxyOptions,
  // isExcerpt = false,
  base: MarkdownBase = options?.config.vite?.base || '/',
) {
  const mdOptions = options?.config.markdown || {}
  const siteConfig: UserSiteConfig = options?.config.siteConfig || {}
  const languages = siteConfig.languages?.filter((language): language is string => Boolean(language))
  const resolveBase = createMarkdownBaseResolver(base)

  if (mdOptions.preConfig)
    mdOptions.preConfig(md)

  // custom plugins
  md.use(highlightLinePlugin)
    .use(preWrapperPlugin, { siteConfig })
    .use(snippetPlugin, options?.userRoot ?? '')
    .use(containerPlugin, {
      languages,
      ...mdOptions?.container,
      blocks: {
        ...mdOptions.blocks,
        ...mdOptions.container?.blocks,
      },
    })
    .use(cssI18nContainer, {
      languages,
    })
    .use(
      linkPlugin,
      {
        target: '_blank',
        rel: 'noreferrer',
        ...mdOptions.externalLinks,
      },
      resolveBase,
    )
    .use(imagePlugin)

  // ref vitepress
  md.use(lineNumberPlugin, mdOptions.lineNumbers)

  // conflict with {% %}
  // 3rd party plugins
  if (!mdOptions.attrs?.disable)
    md.use(attrsPlugin, mdOptions.attrs)

  md.use(emojiPluginCompat)
    .use(footnotePluginCompat)
    .use(footnoteTooltipPlugin)

  // if (!isExcerpt) {
  md.use(anchorPluginCompat, {
    slugify,
    getTokensText: (tokens) => {
      return tokens
        .filter(t => !['html_inline', 'emoji'].includes(t.type))
        .map(t => t.content)
        .join('')
    },
    permalink: anchorPluginCompat.permalink.linkInsideHeader({
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
  // }

  md
    .use(sfcPluginCompat, {
      ...mdOptions.sfc,
    } as SfcPluginOptions)
    .use(tocPluginCompat, {
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
        return mapRenderResult(
          origMathInline.apply(this, args),
          html => html.replace(/^<mjx-container /, '<mjx-container v-pre '),
        )
      }
      const origMathBlock = md.renderer.rules.math_block!
      md.renderer.rules.math_block = function (...args) {
        return mapRenderResult(
          origMathBlock.apply(this, args),
          html => html.replace(/^<mjx-container /, '<mjx-container v-pre tabindex="0" '),
        )
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

      const titleText = namedIconMatch ? title![1].replace(namedIconMatch[0], '') : title![1]
      const wrap = (code: string) =>
        `<div class="vp-code-block-title">\n      <div class="vp-code-block-title-bar">\n          <span class="vp-code-block-title-text" data-title="${md.utils.escapeHtml(title![1])}">${md.utils.escapeHtml(titleText)}</span>\n      </div>\n        ${code}\n      </div>\n      `

      return isPromiseLike(innerResult)
        ? (innerResult as unknown as Promise<string>).then(wrap)
        : wrap(innerResult as string)
    }

    // Non-title case: pass through
    return fenceBeforeGroupIcon(...args)
  }) as typeof fenceBeforeGroupIcon

  if (mdOptions.config)
    mdOptions.config(md)

  return md
}
