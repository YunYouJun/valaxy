import type MarkdownIt from 'markdown-it'
import type { ILanguageRegistration, IThemeRegistration } from 'shiki'

import type anchorPlugin from 'markdown-it-anchor'

import type { KatexOptions } from 'katex'

import {
  type FrontmatterPluginOptions,
} from '@mdit-vue/plugin-frontmatter'
import {
  type HeadersPluginOptions,
} from '@mdit-vue/plugin-headers'
import { type SfcPluginOptions } from '@mdit-vue/plugin-sfc'
import { type TocPluginOptions } from '@mdit-vue/plugin-toc'

// import type { lazyloadOptions } from './plugins/markdown-it/lazyload'

import { type Blocks } from './plugins/markdown-it/container'

export type ThemeOptions =
  | IThemeRegistration
  | { light: IThemeRegistration; dark: IThemeRegistration }

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
  defaultHighlightLang?: string
  // mdit-vue plugins
  frontmatter?: FrontmatterPluginOptions
  headers?: HeadersPluginOptions
  sfc?: SfcPluginOptions
  toc?: TocPluginOptions
  /**
   * @see [markdown-it-image-figures](https://www.npmjs.com/package/markdown-it-image-figures)
   */
  imageFigures?: {
    lazy: boolean
    removeSrc: boolean
    async: boolean
    classes: string
  }

  katex?: KatexOptions
  /**
   * shiki
   */
  theme?: ThemeOptions
  languages?: ILanguageRegistration[]
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
