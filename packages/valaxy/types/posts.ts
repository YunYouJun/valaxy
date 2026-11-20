import type { PageFrontMatter, PostFrontMatter } from 'valaxy/types/frontmatter'
import type { CollectionConfig } from '../client/types'

export type Page = Partial<PageFrontMatter>
export type Post = Partial<PostFrontMatter> & {
  /**
   * Runtime-only field set by `mergeCollapsedCollections`.
   * Present when this post entry represents a collapsed collection.
   * @internal
   */
  _collection?: CollectionConfig
}
