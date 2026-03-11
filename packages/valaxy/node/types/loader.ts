import type { ValaxyNode } from './config'

export interface ContentItem {
  /**
   * Route path relative to pages/, e.g. 'posts/my-post.md'
   * Must end with .md
   */
  path: string
  /**
   * Full markdown content including YAML frontmatter block
   */
  content: string
  /**
   * Optional digest for incremental caching (skip write if unchanged)
   */
  digest?: string
}

export interface ContentLoaderContext {
  node: ValaxyNode
  /** .valaxy/content/ */
  cacheDir: string
  mode: 'dev' | 'build'
}

export interface ContentLoader {
  name: string
  load: (ctx: ContentLoaderContext) => Promise<ContentItem[]> | ContentItem[]
  /**
   * Polling interval (ms) for dev mode.
   * undefined = no polling
   */
  devPollInterval?: number
  /**
   * Per-item transform before writing to cache
   */
  transform?: (item: ContentItem) => ContentItem | Promise<ContentItem>
  cleanup?: () => Promise<void> | void
}

/**
 * @experimental
 * Define a content loader for fetching content from external CMS platforms.
 * @see https://github.com/YunYouJun/valaxy/issues/294
 */
export function defineContentLoader(loader: ContentLoader): ContentLoader {
  return loader
}
