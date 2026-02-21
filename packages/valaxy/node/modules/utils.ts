import type { ResolvedValaxyOptions } from '../types'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { matterOptions } from '../plugins/markdown/transform/matter'

export interface RawPost {
  data: Record<string, any>
  content: string
  excerpt?: string
  /** Absolute file path */
  filePath: string
}

/**
 * Scan markdown files from `pages/posts/` directory.
 *
 * Uses `fg.convertPathToPattern` for Windows path compatibility.
 */
export async function scanPostFiles(userRoot: string, globPattern = '**/*.md'): Promise<string[]> {
  const pattern = fg.convertPathToPattern(path.join(userRoot, 'pages/posts'))
  return fg(`${pattern}/${globPattern}`)
}

/**
 * Read and parse frontmatter from markdown files.
 */
export async function readPostFiles(files: string[]): Promise<RawPost[]> {
  return Promise.all(files.map(async (filePath) => {
    const raw = await readFile(filePath, 'utf-8')
    const { data, content, excerpt } = matter(raw, matterOptions)
    return { data, content, excerpt, filePath }
  }))
}

/**
 * Filter out posts that should not be publicly visible:
 * - `password` (encrypted)
 * - `draft`
 * - `hide` (any truthy value)
 */
export function filterPublicPosts(posts: RawPost[]): RawPost[] {
  return posts.filter(({ data }) => !data.password && !data.draft && !data.hide)
}

/**
 * Convert an absolute markdown file path to a URL path relative to site root.
 *
 * Handles `index.md` normalization:
 * - `pages/posts/hello.md` → `/posts/hello`
 * - `pages/posts/foo/index.md` → `/posts/foo`
 *
 * @param filePath Absolute file path
 * @param userRoot User root directory
 */
export function filePathToUrlPath(filePath: string, userRoot: string): string {
  const relativePath = path.relative(path.join(userRoot, 'pages'), filePath)
  const normalized = `/${relativePath.replace(/\\/g, '/')}`

  if (normalized.endsWith('/index.md'))
    return normalized.slice(0, -'/index.md'.length)

  return normalized.replace(/\.md$/, '')
}

/**
 * Remove trailing slash from a URL string (except for root '/').
 */
export function removeTrailingSlash(url: string): string {
  return url !== '/' && url.endsWith('/') ? url.slice(0, -1) : url
}

/**
 * Get the site URL without trailing slash, with a safe fallback.
 */
export function getSiteUrl(options: ResolvedValaxyOptions): string {
  const url = options.config.siteConfig.url
  if (!url || url === '/')
    return ''
  return removeTrailingSlash(url)
}
