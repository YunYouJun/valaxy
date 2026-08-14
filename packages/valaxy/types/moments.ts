export interface MomentsAuthor {
  avatar?: string
  name?: string
}

export interface MomentsOptions {
  author?: MomentsAuthor
  batchSize?: number
  initialCount?: number
}

/** Options read from the `moments` field of `pages/moments/index.md`. */
export interface MomentsPageFrontmatter {
  description?: string | Record<string, string>
  moments?: MomentsOptions
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
