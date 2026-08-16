export interface MomentsAuthor {
  avatar?: string
  name?: string
}

export interface MomentsLikeOptions {
  /** Enable the shared like count UI. @default false */
  enabled?: boolean
  /** HTTP endpoint implementing the moments like API. @default '/api/moments-like' */
  endpoint?: string
}

export interface MomentsOptions {
  author?: MomentsAuthor
  batchSize?: number
  description?: string | Record<string, string>
  initialCount?: number
  likes?: MomentsLikeOptions
  title?: string | Record<string, string>
}

export type MomentsPageOptions = Pick<MomentsOptions, 'author' | 'batchSize' | 'initialCount' | 'likes'>

/** Options read from the `moments` field of `pages/moments/index.md`. */
export interface MomentsPageFrontmatter {
  description?: string | Record<string, string>
  moments?: MomentsPageOptions
  title?: string | Record<string, string>
}

export interface MomentImage {
  alt?: string
  height?: number
  src: string
  width?: number
}

export type MomentImageInput = string | MomentImage

export interface MomentFrontmatter {
  date: string | Date
  draft?: boolean
  hide?: boolean | 'all' | 'index'
  images?: MomentImageInput[]
  location?: string
  title?: string
  top?: number
  updated?: string | Date
}

export interface MomentEntry extends Omit<MomentFrontmatter, 'images'> {
  content: string
  images: MomentImage[]
  path: string
}

export interface MomentRouteInput {
  aliasOf?: unknown
  meta?: {
    frontmatter?: Partial<MomentFrontmatter>
    momentContent?: string
  }
  path: string
}
