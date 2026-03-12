import type { CollectionConfig } from '../client/types'
import type { PageFrontMatter, PostFrontMatter } from './frontmatter'

export type Page = Partial<PageFrontMatter>
export type Post = Partial<PostFrontMatter> & {
  /**
   * Runtime-only field set by `mergeCollapsedCollections`.
   * Present when this post entry represents a collapsed collection.
   * @internal
   */
  _collection?: CollectionConfig
}
