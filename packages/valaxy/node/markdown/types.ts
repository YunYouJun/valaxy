import type MarkdownIt from 'markdown-it'

import type {
  BuiltinTheme,
  Highlighter,
  LanguageInput,
  ShikijiTransformer,
  ThemeRegistration
  ,
} from 'shikiji'
import type anchorPlugin from 'markdown-it-anchor'

import type { KatexOptions } from 'katex'

import type {
  FrontmatterPluginOptions,
} from '@mdit-vue/plugin-frontmatter'
import type {
  HeadersPluginOptions,
} from '@mdit-vue/plugin-headers'
import type { SfcPluginOptions } from '@mdit-vue/plugin-sfc'
import type { TocPluginOptions } from '@mdit-vue/plugin-toc'

// import type { lazyloadOptions } from './plugins/markdown-it/lazyload'

import type {
  ComponentPluginOptions,
} from '@mdit-vue/plugin-component'
import type { Blocks } from './plugins/markdown-it/container'

export type ThemeOptions =
  | ThemeRegistration
  | BuiltinTheme
  | {
    light: ThemeRegistration | BuiltinTheme
    dark: ThemeRegistration | BuiltinTheme
  }

export interface MarkdownOptions {
  /**
   * Setup markdown-it instance before applying plugins
   */
  preConfig?: (md: MarkdownIt) => void
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
  /**
   * Custom theme for syntax highlighting.
   *
   * You can also pass an object with `light` and `dark` themes to support dual themes.
   *
   * @example { theme: 'github-dark' }
   * @example { theme: { light: 'github-light', dark: 'github-dark' } }
   *
   * You can use an existing theme.
   * @see https://github.com/antfu/shikiji/blob/main/docs/themes.md#all-themes
   * Or add your own theme.
   * @see https://github.com/antfu/shikiji/blob/main/docs/themes.md#load-custom-themes
   */
  theme?: ThemeOptions
  /**
   * Languages for syntax highlighting.
   * @see https://github.com/antfu/shikiji/blob/main/docs/languages.md#all-themes
   */
  languages?: LanguageInput[]
  /**
   * Custom language aliases.
   *
   * @example { 'my-lang': 'js' }
   * @see https://github.com/antfu/shikiji/tree/main#custom-language-aliases
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
   * @see https://github.com/antfu/shikiji#hast-transformers
   */
  codeTransformers?: ShikijiTransformer[]
  /**
   * Setup Shikiji instance
   */
  shikijiSetup?: (shikiji: Highlighter) => void | Promise<void>
  // mdit-vue plugins
  frontmatter?: FrontmatterPluginOptions
  headers?: HeadersPluginOptions
  sfc?: SfcPluginOptions
  toc?: TocPluginOptions
  /**
   * Options for `@mdit-vue/plugin-component`
   * @see https://github.com/mdit-vue/mdit-vue/tree/main/packages/plugin-component
   */
  component?: ComponentPluginOptions
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
   * Custom block configurations
   */
  blocks?: Blocks

  externalLinks?: Record<string, string>
  /* lazyload?: {
    enabled?: boolean
    options: lazyloadOptions
  } */
}
