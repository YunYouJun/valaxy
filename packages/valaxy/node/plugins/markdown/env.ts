// ref vitepress src/node/markdown/env.ts
import type { MarkdownSfcBlocks } from '@mdit-vue/plugin-sfc'
import type { CleanUrlsMode, Page } from 'valaxy/types'
import type { Header } from '@valaxyjs/utils'

// Manually declaring all properties as rollup-plugin-dts
// is unable to merge augmented module declarations

export interface MarkdownEnv {
  /**
   * The raw Markdown content without frontmatter
   */
  content?: string
  /**
   * The excerpt that extracted by `@mdit-vue/plugin-frontmatter`
   *
   * - Would be the rendered HTML when `renderExcerpt` is enabled
   * - Would be the raw Markdown when `renderExcerpt` is disabled
   */
  excerpt?: string
  /**
   * The frontmatter that extracted by `@mdit-vue/plugin-frontmatter`
   */
  frontmatter?: Page
  /**
   * The headers that extracted by `@mdit-vue/plugin-headers`
   */
  headers?: Header[]
  /**
   * SFC blocks that extracted by `@mdit-vue/plugin-sfc`
   */
  sfcBlocks?: MarkdownSfcBlocks
  /**
   * The title that extracted by `@mdit-vue/plugin-title`
   */
  title?: string
  path: string
  relativePath: string
  links?: string[]
  realPath?: string

  cleanUrls?: CleanUrlsMode
}
