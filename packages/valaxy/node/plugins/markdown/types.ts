import type {
  HeadersPluginOptions,
} from '@mdit-vue/plugin-headers'

import type { SfcPluginOptions } from '@mdit-vue/plugin-sfc'
import type { TocPluginOptions } from '@mdit-vue/plugin-toc'
import type { KatexOptions } from 'katex'

import type { StateCore, Token } from 'markdown-it'

import type {
  BuiltinTheme,
  Highlighter,
  LanguageInput,
  ShikiTransformer,
  ThemeRegistration,
} from 'shiki'
import type { PageData } from '../../../types'

// import type { lazyloadOptions } from './plugins/markdown-it/lazyload'

import type { ValaxyFileInfo } from '../../app/state'
import type { BlockItem, Blocks, ContainerOptions } from './plugins/markdown-it/container'
import type { MarkdownRenderer, MarkdownRendererOptions } from './renderer'

/**
 * Immutable per-file snapshot passed through the Markdown compile pipeline.
 */
export interface MarkdownTransformContext {
  readonly id: string
  readonly fileInfo?: Readonly<ValaxyFileInfo>
}

export type ThemeOptions
  = | ThemeRegistration
    | BuiltinTheme
    | {
      light: ThemeRegistration | BuiltinTheme
      dark: ThemeRegistration | BuiltinTheme
    }

export interface MarkdownAnchorPermalinkOptions {
  class?: string
  symbol?: string
  renderHref?: (slug: string, state: StateCore) => string
  renderAttrs?: (slug: string, state: StateCore) => Record<string, string | number>
}

export type MarkdownAnchorPermalinkGenerator = (
  slug: string,
  options: MarkdownAnchorPermalinkOptions,
  state: StateCore,
  index: number,
) => void

export interface MarkdownAnchorOptions {
  level?: number | number[]
  slugify?: (value: string) => string
  slugifyWithState?: (value: string, state: StateCore) => string
  getTokensText?: (tokens: Token[]) => string
  uniqueSlugStartIndex?: number
  permalink?: MarkdownAnchorPermalinkGenerator
  callback?: (token: Token, info: { slug: string, title: string }) => void
  tabIndex?: number | false
}

/**
 * Extend Markdown options
 * @zh 扩展 Markdown 配置，包含代码高亮、Markdown-it 和插件配置
 */
export interface MarkdownOptions extends MarkdownRendererOptions {
  /**
   * Setup markdown-it instance before applying plugins
   */
  preConfig?: (md: MarkdownRenderer) => void
  /**
   * markdown-it options
   */
  options?: MarkdownRenderer['options']
  /**
   * config markdown-it
   */
  config?: (md: MarkdownRenderer) => void
  anchor?: MarkdownAnchorOptions
  attrs?: {
    leftDelimiter?: string
    rightDelimiter?: string
    allowedAttributes?: string[]
    disable?: boolean
  }
  /* ==================== Syntax Highlighting ==================== */

  /**
   * Custom theme for syntax highlighting.
   *
   * You can also pass an object with `light` and `dark` themes to support dual themes.
   *
   * @see You can use an existing theme. https://shiki.style/themes
   * @see Or add your own theme. https://shiki.style/guide/load-theme
   *
   * @example { theme: 'github-dark' }
   * @example light and dark themes
   * ```js
   * { theme: { light: 'github-light', dark: 'github-dark' } }
   * ```
   */
  theme?: ThemeOptions
  /**
   * Languages for syntax highlighting.
   * @see https://shiki.style/languages
   */
  languages?: LanguageInput[]
  /**
   * Custom language aliases.
   *
   * @example { 'my-lang': 'js' }
   * @see https://shiki.style/guide/load-lang#custom-language-aliases
   */
  languageAlias?: Record<string, string>
  /**
   * Show line numbers in code blocks
   * @default false
   */
  lineNumbers?: boolean
  /**
   * Fallback language when the specified language is not available.
   */
  defaultHighlightLang?: string
  /**
   * Transformers applied to code blocks
   * @see https://shiki.style/guide/transformers
   */
  codeTransformers?: ShikiTransformer[]
  /**
   * Setup Shiki instance
   */
  shikiSetup?: (shiki: Highlighter) => void | Promise<void>

  /* ==================== Markdown It Plugins ==================== */
  // mdit-vue plugins
  /**
   * Options for `@mdit-vue/plugin-headers`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-headers
   */
  headers?: HeadersPluginOptions | boolean
  /**
   * Options for `@mdit-vue/plugin-sfc`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-sfc
   */
  sfc?: SfcPluginOptions
  /**
   * Options for `@mdit-vue/plugin-toc`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-toc
   */
  toc?: TocPluginOptions
  /**
   * Options for `markdown-it-container`
   * @see https://github.com/markdown-it/markdown-it-container
   */
  container?: ContainerOptions
  /**
   * Custom block configurations based on `markdown-it-container`
   */
  blocks?: Record<string, BlockItem> | Blocks

  /**
   * @see [markdown-it-image-figures](https://www.npmjs.com/package/markdown-it-image-figures)
   */
  imageFigures?: {
    lazy: boolean
    removeSrc: boolean
    async: boolean
    classes: string
  }

  /**
   * @see https://katex.org/docs/options.html
   */
  katex?: KatexOptions

  /**
   * Options for `markdown-it-mathjax3`
   * @see https://github.com/tani/markdown-it-mathjax3
   */
  mathjax?: any

  externalLinks?: Record<string, string>
  /* lazyload?: {
    enabled?: boolean
    options: lazyloadOptions
  } */
}

export interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
  deadLinks: { url: string, file: string }[]
  includes: string[]
}
