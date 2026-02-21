import type { ResolvedValaxyOptions } from '../../types'
import path from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'fs-extra'
import ora from 'ora'
import { tObject } from '../../../shared'
import { LOCALE_PREFIX } from '../../../shared/constants'
import { loadLocalesYml, nodeT } from '../../../shared/node/i18n'
import { filePathToUrlPath, filterPublicPosts, getSiteUrl, readPostFiles, scanPostFiles } from '../utils'

export interface LlmsPost {
  title: string
  description: string
  date: Date
  /** URL path relative to site root, e.g. '/posts/hello' */
  urlPath: string
  /** Raw markdown content (without frontmatter) */
  content: string
}

/**
 * Resolve a config value that may be a `$locale:` key, a `Record<lang, string>`, or a plain string.
 */
export function resolveText(value: string | Record<string, string>, lang: string): string {
  if (typeof value === 'string' && value.startsWith(LOCALE_PREFIX))
    return nodeT(value, lang)
  return tObject(value, lang) as string
}

/**
 * Generate llms.txt, llms-full.txt, and raw .md files for AI-readable content.
 * @see https://llmstxt.org/
 */
export async function build(options: ResolvedValaxyOptions) {
  const s = ora('Generating llms.txt ...').start()

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
  const files = await scanPostFiles(options.userRoot)
  const rawPosts = await readPostFiles(files)
  const publicPosts = filterPublicPosts(rawPosts)

  const posts = publicPosts.map<LlmsPost>(({ data, content, filePath }) => ({
    title: resolveText(data.title, lang) || path.basename(filePath, '.md'),
    description: resolveText(data.description, lang) || '',
    date: data.date ? new Date(data.date) : new Date(0),
    urlPath: filePathToUrlPath(filePath, options.userRoot),
    content,
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

  // Copy raw .md files to dist
  if (llmsConfig.files) {
    await Promise.all(posts.map(async (post) => {
      const mdPath = path.resolve(distPath, `${post.urlPath.slice(1)}.md`)
      await fs.ensureDir(path.dirname(mdPath))
      await fs.writeFile(mdPath, post.content, 'utf-8')
    }))
    consola.debug(`[llms] Copied ${colors.dim(posts.length.toString())} raw .md files to dist/`)
  }

  s.succeed(`llms.txt generated. (${posts.length} posts)`)
}

/**
 * Generate the llms.txt index file content following the llms.txt standard.
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

  // H2: Posts section with links to .md files
  lines.push('## Posts')
  lines.push('')
  for (const post of posts) {
    const mdUrl = siteUrl
      ? `${siteUrl}${post.urlPath}.md`
      : `${post.urlPath}.md`
    const desc = post.description ? `: ${post.description}` : ''
    lines.push(`- [${post.title}](${mdUrl})${desc}`)
  }
  lines.push('')

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
    if (post.description) {
      lines.push(post.description)
      lines.push('')
    }
    lines.push(post.content.trim())
    lines.push('')
  }

  return lines.join('\n')
}
