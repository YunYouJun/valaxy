import type { LlmsCollapse, LlmsFeatured } from '../../../types/config'
import type { PostFrontMatter } from '../../../types/frontmatter'
import type { ResolvedValaxyOptions } from '../../types'
import path from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'fs-extra'
import * as yaml from 'js-yaml'
import picomatch from 'picomatch'
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

const PAGES_SECTION = 'Pages'

interface ResolvedLlmsCollapse {
  title: string
  description: string
  href: string
  section: string
  ruleIndex: number
}

interface LlmsIndexEntry {
  title: string
  description: string
  href: string
}

interface LlmsSelection {
  exclude?: string[]
  collapse?: LlmsCollapse[]
  locales?: string[]
}

/**
 * Scan, read, filter, and sort pages included in llms output.
 */
export async function loadLlmsPosts(options: ResolvedValaxyOptions): Promise<LlmsPost[]> {
  const { config } = options
  const siteConfig = config.siteConfig
  const llmsConfig = siteConfig.llms
  const lang = siteConfig.lang || 'en'

  // Load locale yml files so nodeT can resolve $locale: keys
  loadLocalesYml(path.resolve(options.userRoot, 'locales'))

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

  posts.sort((a, b) => +b.date - +a.date)
  return posts
}

/**
 * Generate llms.txt, llms-full.txt, and raw .md files for AI-readable content.
 * Excluded and collapsed pages stay out of the index and full text.
 * Individual `.md` files are still written for every public page when `files` is on.
 * @see https://llmstxt.org/
 */
export async function build(options: ResolvedValaxyOptions) {
  consola.start('Generating llms.txt ...')

  const { config } = options
  const siteConfig = config.siteConfig
  const llmsConfig = siteConfig.llms
  const lang = siteConfig.lang || 'en'

  const siteUrl = getSiteUrl(options)
  if (!siteUrl) {
    consola.warn('`url` is not set in site.config.ts. llms.txt will use relative paths.')
  }

  const posts = await loadLlmsPosts(options)
  const selection = llmsSelection(llmsConfig)
  warnUnmatchedCollapse(posts, selection)

  const distPath = path.resolve(options.userRoot, 'dist')
  await fs.ensureDir(distPath)

  const title = resolveText(siteConfig.title, lang) || 'Valaxy Blog'
  const description = resolveText(siteConfig.description, lang)

  const llmsTxt = generateLlmsTxt({
    title,
    description,
    prompt: llmsConfig.prompt,
    posts,
    siteUrl,
    ...selection,
    sectionOrder: llmsConfig.sectionOrder,
    featured: llmsConfig.featured,
  })
  await fs.writeFile(path.resolve(distPath, 'llms.txt'), llmsTxt, 'utf-8')
  consola.debug(`[llms] Generated ${colors.dim('dist/llms.txt')}`)

  if (llmsConfig.fullText) {
    const llmsFullTxt = generateLlmsFullTxt({
      title,
      description,
      prompt: llmsConfig.prompt,
      posts,
      exclude: selection.exclude,
      collapse: selection.collapse,
    })
    await fs.writeFile(path.resolve(distPath, 'llms-full.txt'), llmsFullTxt, 'utf-8')
    consola.debug(`[llms] Generated ${colors.dim('dist/llms-full.txt')}`)
  }

  // Copy raw .md files to dist with metadata header, including excluded and collapsed pages
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

function llmsSelection(llms: { exclude?: string[], collapse?: LlmsCollapse[], locales?: string[] }): LlmsSelection {
  return {
    exclude: llms.exclude,
    collapse: llms.collapse,
    locales: llms.locales,
  }
}

function warnUnmatchedCollapse(posts: LlmsPost[], selection: LlmsSelection) {
  const rules = selection.collapse || []
  if (rules.length === 0)
    return
  const { collapseLinks } = planLlmsPages(posts, selection)
  for (const [index, rule] of rules.entries()) {
    if (!rule?.match?.trim())
      continue
    if (!collapseLinks.some(link => link.ruleIndex === index))
      consola.warn(`[llms] collapse pattern matched no pages: ${rule.match}`)
  }
}

function normalizeGlobPattern(pattern: string): string {
  return pattern.trim().replace(/^\.\//, '').replace(/^\//, '')
}

/**
 * Site path without a trailing slash or `.md` suffix.
 * `/guide/getting-started.md` and `/guide/getting-started/` both become `/guide/getting-started`.
 */
function normalizeLlmsPath(input: string): string {
  let value = input.trim()
  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname
    }
    catch {
      // Keep the original string when it is not a URL.
    }
  }
  if (!value.startsWith('/'))
    value = `/${value}`
  if (value.endsWith('/index.md'))
    value = value.slice(0, -'/index.md'.length)
  else if (value.endsWith('.md'))
    value = value.slice(0, -3)
  if (value.length > 1 && value.endsWith('/'))
    value = value.slice(0, -1)
  return value || '/'
}

/** Page-relative paths a glob may refer to for this URL. */
function pageGlobCandidates(urlPath: string): string[] {
  const relativePath = normalizeLlmsPath(urlPath).replace(/^\//, '')
  if (!relativePath)
    return ['index.md']
  return [`${relativePath}.md`, `${relativePath}/index.md`]
}

function createGlobMatcher(patterns: string[] | undefined) {
  const normalized = (patterns || []).map(normalizeGlobPattern).filter(Boolean)
  if (normalized.length === 0)
    return () => false
  const isMatch = picomatch(normalized, { dot: true, windows: false })
  return (urlPath: string) => pageGlobCandidates(urlPath).some(candidate => isMatch(candidate))
}

function capitalizeSection(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

function splitLlmsLocale(urlPath: string, locales?: string[]): { locale?: string, parts: string[] } {
  const parts = normalizeLlmsPath(urlPath).split('/').filter(Boolean)
  if (!locales?.length || parts.length === 0)
    return { parts }
  const locale = locales.find(item => item.toLowerCase() === parts[0].toLowerCase())
  if (!locale)
    return { parts }
  return { locale, parts: parts.slice(1) }
}

function formatLocaleSection(name: string, locale?: string): string {
  return locale ? `${name} (${locale})` : name
}

/**
 * Section heading for a page URL.
 * Without `locales`, the first path segment is the section (`/zh/guide/why` → `Zh`).
 * With `locales`, that prefix is a language (`/zh/guide/why` → `Guide (zh)`).
 */
function getLlmsSectionName(urlPath: string, locales?: string[]): string {
  const { locale, parts } = splitLlmsLocale(urlPath, locales)
  const name = parts.length >= 2 ? capitalizeSection(parts[0]) : PAGES_SECTION
  return formatLocaleSection(name, locale)
}

function sectionFromHref(href: string, locales?: string[], explicit?: string): string {
  if (explicit)
    return explicit
  const normalized = normalizeLlmsPath(href)
  const named = getLlmsSectionName(normalized, locales)
  if (named !== PAGES_SECTION && !named.startsWith(`${PAGES_SECTION} (`))
    return named
  const { locale, parts } = splitLlmsLocale(normalized, locales)
  if (parts.length === 1)
    return formatLocaleSection(capitalizeSection(parts[0]), locale)
  return named
}

function entryUrl(siteUrl: string, href: string): string {
  if (/^https?:\/\//i.test(href))
    return href
  if (href.endsWith('.md'))
    return siteUrl ? `${siteUrl}${href.startsWith('/') ? href : `/${href}`}` : href
  return hrefToUrl(siteUrl, href)
}

function hrefToUrl(siteUrl: string, href: string): string {
  const trimmed = href.trim()
  if (/^https?:\/\//i.test(trimmed))
    return trimmed
  const directory = trimmed.endsWith('/')
  const urlPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const target = directory || urlPath.endsWith('.md') ? urlPath : `${normalizeLlmsPath(urlPath)}.md`
  return siteUrl ? `${siteUrl}${target}` : target
}

function planLlmsPages(posts: LlmsPost[], config: LlmsSelection = {}): { visible: LlmsPost[], collapseLinks: ResolvedLlmsCollapse[] } {
  const excluded = createGlobMatcher(config.exclude)
  const rules = config.collapse || []
  const matchers = rules.map(rule => createGlobMatcher(rule?.match ? [rule.match] : []))
  const matched = new Set<number>()
  const visible: LlmsPost[] = []

  for (const post of posts) {
    if (excluded(post.urlPath))
      continue
    const ruleIndex = matchers.findIndex(match => match(post.urlPath))
    if (ruleIndex >= 0) {
      matched.add(ruleIndex)
      continue
    }
    visible.push(post)
  }

  const collapseLinks = [...matched].sort((a, b) => a - b).map((ruleIndex) => {
    const rule = rules[ruleIndex]
    return {
      title: rule.title,
      description: rule.description || '',
      href: rule.href,
      section: sectionFromHref(rule.href, config.locales, rule.section),
      ruleIndex,
    }
  })

  return { visible, collapseLinks }
}

function appendBlockquote(lines: string[], description: string, prompt: string) {
  const promptLines = prompt ? prompt.split(/\r?\n/) : []
  if (!description && promptLines.length === 0)
    return
  if (description)
    lines.push(`> ${description}`)
  if (promptLines.length > 0) {
    if (description)
      lines.push('>')
    for (const line of promptLines)
      lines.push(line ? `> ${line}` : '>')
  }
  lines.push('')
}

function formatIndexLink(title: string, url: string, description: string): string {
  const desc = description ? `: ${description}` : ''
  return `- [${title}](${url})${desc}`
}

function groupLlmsEntries(params: {
  posts: LlmsPost[]
  collapseLinks: ResolvedLlmsCollapse[]
  locales?: string[]
  sectionOrder?: string[]
  featured?: LlmsFeatured
}): Map<string, LlmsIndexEntry[]> {
  const featuredPaths = params.featured?.paths || []
  const featuredPosts: LlmsPost[] = []
  const rest: LlmsPost[] = []

  if (featuredPaths.length > 0) {
    const byPath = new Map(params.posts.map(post => [normalizeLlmsPath(post.urlPath), post]))
    const used = new Set<LlmsPost>()
    for (const item of featuredPaths) {
      const post = byPath.get(normalizeLlmsPath(item))
      if (post && !used.has(post)) {
        featuredPosts.push(post)
        used.add(post)
      }
    }
    for (const post of params.posts) {
      if (!used.has(post))
        rest.push(post)
    }
  }
  else {
    rest.push(...params.posts)
  }

  const sections = new Map<string, LlmsIndexEntry[]>()
  const featuredTitle = params.featured?.title || 'Docs'
  if (featuredPosts.length > 0) {
    sections.set(featuredTitle, featuredPosts.map(post => ({
      title: post.title,
      description: post.description,
      href: `${post.urlPath}.md`,
    })))
  }

  for (const post of rest) {
    const section = getLlmsSectionName(post.urlPath, params.locales)
    const entries = sections.get(section)
    const entry = {
      title: post.title,
      description: post.description,
      href: `${post.urlPath}.md`,
    }
    if (entries)
      entries.push(entry)
    else
      sections.set(section, [entry])
  }

  const collapsed = new Map<string, LlmsIndexEntry[]>()
  for (const link of params.collapseLinks) {
    const entries = collapsed.get(link.section) || []
    entries.push({
      title: link.title,
      description: link.description,
      href: link.href,
    })
    collapsed.set(link.section, entries)
  }
  for (const [section, links] of collapsed) {
    const entries = sections.get(section)
    if (entries)
      entries.unshift(...links)
    else
      sections.set(section, links)
  }

  return orderSections(sections, params.sectionOrder, featuredPosts.length > 0 ? featuredTitle : undefined)
}

function orderSections(
  sections: Map<string, LlmsIndexEntry[]>,
  sectionOrder?: string[],
  featuredTitle?: string,
): Map<string, LlmsIndexEntry[]> {
  const entries = [...sections.entries()]
  if (!sectionOrder?.length)
    return sections

  const byName = new Map(entries.map(([name, items]) => [name.toLowerCase(), [name, items] as const]))
  const used = new Set<string>()
  const ordered: [string, LlmsIndexEntry[]][] = []

  if (featuredTitle && !sectionOrder.some(name => name.toLowerCase() === featuredTitle.toLowerCase())) {
    const found = byName.get(featuredTitle.toLowerCase())
    if (found) {
      ordered.push([found[0], found[1]])
      used.add(found[0])
    }
  }

  for (const name of sectionOrder) {
    const found = byName.get(name.toLowerCase())
    if (found && !used.has(found[0])) {
      ordered.push([found[0], found[1]])
      used.add(found[0])
    }
  }
  for (const [name, items] of entries) {
    if (!used.has(name))
      ordered.push([name, items])
  }
  return new Map(ordered)
}

/**
 * Generate the llms.txt index file content following the llms.txt standard.
 * Pages are grouped by their top-level directory (e.g. Posts, Guide, etc.).
 * Optional `locales`, `sectionOrder`, `exclude`, `featured`, and `collapse` adjust that index.
 * @see https://llmstxt.org/
 */
export function generateLlmsTxt(params: {
  title: string
  description: string
  prompt: string
  posts: LlmsPost[]
  siteUrl: string
  exclude?: string[]
  locales?: string[]
  sectionOrder?: string[]
  featured?: LlmsFeatured
  collapse?: LlmsCollapse[]
}): string {
  const { title, description, prompt, posts, siteUrl } = params
  const plan = planLlmsPages(posts, params)
  const sections = groupLlmsEntries({
    posts: plan.visible,
    collapseLinks: plan.collapseLinks,
    locales: params.locales,
    sectionOrder: params.sectionOrder,
    featured: params.featured,
  })

  const lines: string[] = []

  lines.push(`# ${title}`)
  lines.push('')
  appendBlockquote(lines, description, prompt)

  for (const [section, entries] of sections) {
    lines.push(`## ${section}`)
    lines.push('')
    for (const entry of entries)
      lines.push(formatIndexLink(entry.title, entryUrl(siteUrl, entry.href), entry.description))
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate the llms-full.txt file with all post content inlined.
 * Pages matching `exclude` or `collapse` are omitted so generated reference trees stay out of the corpus.
 */
export function generateLlmsFullTxt(params: {
  title: string
  description: string
  prompt: string
  posts: LlmsPost[]
  exclude?: string[]
  collapse?: LlmsCollapse[]
}): string {
  const { title, description, prompt } = params
  const { visible } = planLlmsPages(params.posts, params)

  const lines: string[] = []

  lines.push(`# ${title}`)
  lines.push('')
  appendBlockquote(lines, description, prompt)

  for (const post of visible) {
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
