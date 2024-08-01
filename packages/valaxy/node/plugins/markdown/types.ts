import type MarkdownIt from 'markdown-it'

import type {
  BuiltinTheme,
  Highlighter,
  LanguageInput,
  ShikiTransformer,
  ThemeRegistration
  ,
} from 'shiki'
import type anchorPlugin from 'markdown-it-anchor'

import type { KatexOptions } from 'katex'
import type { PageData } from 'valaxy/types'

import type {
  HeadersPluginOptions,
} from '@mdit-vue/plugin-headers'
import type { SfcPluginOptions } from '@mdit-vue/plugin-sfc'
import type { TocPluginOptions } from '@mdit-vue/plugin-toc'

// import type { lazyloadOptions } from './plugins/markdown-it/lazyload'

import type { Blocks, ContainerOptions } from './plugins/markdown-it/container'

export type ThemeOptions =
  | ThemeRegistration
  | BuiltinTheme
  | {
    light: ThemeRegistration | BuiltinTheme
    dark: ThemeRegistration | BuiltinTheme
  }

/**
 * Extend Markdown options
 * @zh 扩展 Markdown 配置，包含代码高亮、Markdown-it 和插件配置
 */
export interface MarkdownOptions {
  /**
   * Setup markdown-it instance before applying plugins
   */
  preConfig?: (md: MarkdownIt) => void
  /**
   * markdown-it options
   */
  options?: MarkdownIt['options']
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
  /* ==================== Syntax Highlighting ==================== */

  /**
   * Custom theme for syntax highlighting.
   *
   * You can also pass an object with `light` and `dark` themes to support dual themes.
   *
   * @example { theme: 'github-dark' }
   * @example { theme: { light: 'github-light', dark: 'github-dark' } }
   *
   * You can use an existing theme.
   * @see https://shiki.style/themes
   * Or add your own theme.
   * @see https://shiki.style/guide/load-theme
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
  blocks?: Blocks

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
