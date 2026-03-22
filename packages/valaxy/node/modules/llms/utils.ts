import type { PostFrontMatter } from '../../../types/frontmatter'
import type { ResolvedValaxyOptions } from '../../types'
import path from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import { tObject } from '../../../shared'
import { SENSITIVE_FRONTMATTER_KEYS } from '../../../shared/constants'
import { loadLocalesYml, nodeT } from '../../../shared/node/i18n'
import { isLocaleKey } from '../../../shared/utils'
import { filePathToUrlPath, filterPublicPosts, getSiteUrl, readPostFiles, scanPageFiles } from '../utils'

export interface LlmsPost {
  title: string
  description: string
  date: Date
  /** URL path relative to site root, e.g. '/posts/hello' */
  urlPath: string
  /** Raw markdown content (without frontmatter) */
  content: string
  /** Original frontmatter data (with sensitive fields removed) */
  rawFrontmatter: Partial<PostFrontMatter>
}

/**
 * Resolve a config value that may be a `$locale:` key, a `Record<lang, string>`, or a plain string.
 */
export function resolveText(value: string | Record<string, string>, lang: string): string {
  if (typeof value === 'string' && isLocaleKey(value))
    return nodeT(value, lang)
  return tObject(value, lang) as string
}

/**
 * Generate llms.txt, llms-full.txt, and raw .md files for AI-readable content.
 * @see https://llmstxt.org/
 */
export async function build(options: ResolvedValaxyOptions) {
  consola.start('Generating llms.txt ...')

  const { config } = options
  const siteConfig = config.siteConfig
  const llmsConfig = siteConfig.llms
  const lang = siteConfig.lang || 'en'

  // Load locale yml files so nodeT can resolve $locale: keys
  loadLocalesYml(path.resolve(options.userRoot, 'locales'))

  const siteUrl = getSiteUrl(options)
  if (!siteUrl) {
    consola.warn('`url` is not set in site.config.ts. llms.txt will use relative paths.')
  }

  // Scan, read, and filter posts
  const include = llmsConfig.include || ['posts/**/*.md']
  const files = await scanPageFiles(options.userRoot, include)
  const rawPosts = await readPostFiles(files)
  const publicPosts = filterPublicPosts(rawPosts)

  const posts = publicPosts.map<LlmsPost>(({ data, content, filePath }) => ({
    title: resolveText(data.title, lang) || path.basename(filePath, '.md'),
    description: resolveText(data.description, lang) || '',
    date: data.date ? new Date(data.date) : new Date(0),
    urlPath: filePathToUrlPath(filePath, options.userRoot),
    content,
    rawFrontmatter: stripSensitiveFrontmatter(data),
  }))

  // Sort by date descending
  posts.sort((a, b) => +b.date - +a.date)

  const distPath = path.resolve(options.userRoot, 'dist')
  await fs.ensureDir(distPath)

  const title = resolveText(siteConfig.title, lang) || 'Valaxy Blog'
  const description = resolveText(siteConfig.description, lang)

  // Generate llms.txt
  const llmsTxt = generateLlmsTxt({
    title,
    description,
    prompt: llmsConfig.prompt,
    posts,
    siteUrl,
  })
  await fs.writeFile(path.resolve(distPath, 'llms.txt'), llmsTxt, 'utf-8')
  consola.debug(`[llms] Generated ${colors.dim('dist/llms.txt')}`)

  // Generate llms-full.txt
  if (llmsConfig.fullText) {
    const llmsFullTxt = generateLlmsFullTxt({
      title,
      description,
      prompt: llmsConfig.prompt,
      posts,
    })
    await fs.writeFile(path.resolve(distPath, 'llms-full.txt'), llmsFullTxt, 'utf-8')
    consola.debug(`[llms] Generated ${colors.dim('dist/llms-full.txt')}`)
  }

  // Copy raw .md files to dist with metadata header
  if (llmsConfig.files) {
    await Promise.all(posts.map(async (post) => {
      const mdPath = path.resolve(distPath, `${post.urlPath.slice(1)}.md`)
      await fs.ensureDir(path.dirname(mdPath))
      const header = formatMetadataHeader(post)
      const body = post.content.trim()
      const fileContent = body ? `${header}${body}\n` : `${header}`
      await fs.writeFile(mdPath, fileContent, 'utf-8')
    }))
    consola.debug(`[llms] Copied ${colors.dim(posts.length.toString())} raw .md files to dist/`)
  }

  consola.success(`llms.txt generated. (${posts.length} pages)`)
}

/**
 * Get the top-level directory section name from a URL path.
 * e.g. '/posts/hello' → 'Posts', '/guide/getting-started' → 'Guide', '/about' → 'Pages'
 */
function getSectionName(urlPath: string): string {
  const parts = urlPath.split('/').filter(Boolean)
  if (parts.length >= 2) {
    const dir = parts[0]
    return dir.charAt(0).toUpperCase() + dir.slice(1)
  }
  return 'Pages'
}

/**
 * Generate the llms.txt index file content following the llms.txt standard.
 * Pages are grouped by their top-level directory (e.g. Posts, Guide, etc.).
 * @see https://llmstxt.org/
 */
export function generateLlmsTxt(params: {
  title: string
  description: string
  prompt: string
  posts: LlmsPost[]
  siteUrl: string
}): string {
  const { title, description, prompt, posts, siteUrl } = params

  const lines: string[] = []

  // H1: Site name
  lines.push(`# ${title}`)
  lines.push('')

  // Blockquote: description + optional prompt
  if (description || prompt) {
    if (description)
      lines.push(`> ${description}`)
    if (prompt) {
      if (description)
        lines.push('>')
      lines.push(`> ${prompt}`)
    }
    lines.push('')
  }

  // Group posts by section
  const sections = new Map<string, LlmsPost[]>()
  for (const post of posts) {
    const section = getSectionName(post.urlPath)
    if (!sections.has(section))
      sections.set(section, [])
    sections.get(section)!.push(post)
  }

  // H2: Each section with links to .md files
  for (const [section, sectionPosts] of sections) {
    lines.push(`## ${section}`)
    lines.push('')
    for (const post of sectionPosts) {
      const mdUrl = siteUrl
        ? `${siteUrl}${post.urlPath}.md`
        : `${post.urlPath}.md`
      const desc = post.description ? `: ${post.description}` : ''
      lines.push(`- [${post.title}](${mdUrl})${desc}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate the llms-full.txt file with all post content inlined.
 */
export function generateLlmsFullTxt(params: {
  title: string
  description: string
  prompt: string
  posts: LlmsPost[]
}): string {
  const { title, description, prompt, posts } = params

  const lines: string[] = []

  // H1: Site name
  lines.push(`# ${title}`)
  lines.push('')

  // Blockquote
  if (description || prompt) {
    if (description)
      lines.push(`> ${description}`)
    if (prompt) {
      if (description)
        lines.push('>')
      lines.push(`> ${prompt}`)
    }
    lines.push('')
  }

  // All posts inlined
  for (const post of posts) {
    lines.push(`## ${post.title}`)
    lines.push('')
    // Inline metadata for LLM context
    const metaLines = formatMetadataLines(post)
    if (metaLines) {
      lines.push(metaLines)
      lines.push('')
    }
    if (post.description) {
      lines.push(post.description)
      lines.push('')
    }
    lines.push(post.content.trim())
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Normalize a frontmatter value to a flat string array.
 * Handles: string, string[], nested arrays (e.g. categories hierarchy), undefined/null.
 */
function normalizeStringArray(value: unknown): string[] {
  if (!value)
    return []
  if (typeof value === 'string')
    return [value]
  if (Array.isArray(value))
    return value.flat(Infinity).filter((v): v is string => typeof v === 'string')
  return []
}

/**
 * Format a date as YYYY-MM-DD string.
 */
function formatDate(date: Date): string {
  if (!date || Number.isNaN(date.getTime()) || date.getTime() === 0)
    return ''
  return date.toISOString().slice(0, 10)
}

/**
 * Strip sensitive/internal frontmatter fields that should not appear in LLM output.
 * Also removes `photos` when gallery is password-protected.
 */
export function stripSensitiveFrontmatter(data: Partial<PostFrontMatter>): Partial<PostFrontMatter> {
  const hasGalleryPassword = 'gallery_password' in data
  const cleaned: Partial<PostFrontMatter> = {}
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FRONTMATTER_KEYS.has(key))
      continue
    // Photos should be hidden when gallery is password-protected
    if (hasGalleryPassword && key === 'photos') {
      continue
    }
    ;(cleaned as Record<string, any>)[key] = value
  }
  return cleaned
}

/**
 * Generate a YAML frontmatter header block for .md file output.
 * Directly serializes the original frontmatter (with sensitive fields removed).
 *
 * Example output:
 * ```
 * ---
 * title: Post Title
 * date: 2024-01-15
 * categories:
 *   - A
 *   - B
 * tags:
 *   - javascript
 *   - vue
 * ---
 * ```
 */
export function formatMetadataHeader(post: LlmsPost): string {
  const fm = post.rawFrontmatter
  if (!fm || Object.keys(fm).length === 0)
    return ''

  const yamlStr = yaml.dump(fm, {
    lineWidth: -1,
    noCompatMode: true,
  }).trimEnd()

  return `---\n${yamlStr}\n---\n\n`
}

/**
 * Format inline metadata lines for llms-full.txt.
 * Returns empty string if no metadata to display.
 */
export function formatMetadataLines(post: LlmsPost): string {
  const items: string[] = []
  const dateStr = formatDate(post.date)
  if (dateStr)
    items.push(`- **Date**: ${dateStr}`)
  const categories = normalizeStringArray(post.rawFrontmatter.categories)
  if (categories.length > 0)
    items.push(`- **Categories**: ${categories.join(' > ')}`)
  const tags = normalizeStringArray(post.rawFrontmatter.tags)
  if (tags.length > 0)
    items.push(`- **Tags**: ${tags.join(', ')}`)
  return items.join('\n')
}
