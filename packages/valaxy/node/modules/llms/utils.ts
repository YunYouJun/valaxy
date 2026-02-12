import type { ResolvedValaxyOptions } from '../../types'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import ora from 'ora'
import { tObject } from '../../../shared'
import { matterOptions } from '../../plugins/markdown/transform/matter'

interface LlmsPost {
  title: string
  description: string
  date: Date
  /** URL path relative to site root, e.g. '/posts/hello' */
  urlPath: string
  /** Raw markdown content (without frontmatter) */
  content: string
}

/**
 * Generate llms.txt, llms-full.txt, and raw .md files for AI-readable content.
 * @see https://llmstxt.org/
 */
export async function build(options: ResolvedValaxyOptions) {
  const s = ora('Generating llms.txt ...').start()

  const { config } = options
  const siteConfig = config.siteConfig
  const llmsConfig = config.modules.llms
  const lang = siteConfig.lang || 'en'

  if (!siteConfig.url || siteConfig.url === '/') {
    consola.warn('`url` is not set in site.config.ts. llms.txt will use relative paths.')
  }

  const siteUrl = siteConfig.url.endsWith('/') ? siteConfig.url.slice(0, -1) : siteConfig.url

  // Scan markdown files
  const files = await fg(`${options.userRoot}/pages/posts/**/*.md`)

  const posts = await getLlmsPosts({ files, lang }, options)

  // Sort by date descending
  posts.sort((a, b) => +b.date - +a.date)

  const distPath = path.resolve(options.userRoot, 'dist')
  await fs.ensureDir(distPath)

  const title = tObject(siteConfig.title, lang) || 'Valaxy Blog'
  const description = tObject(siteConfig.description, lang)

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
  if (llmsConfig.copyMarkdown) {
    for (const post of posts) {
      const mdPath = path.resolve(distPath, `${post.urlPath.slice(1)}.md`)
      await fs.ensureDir(path.dirname(mdPath))
      await fs.writeFile(mdPath, post.content, 'utf-8')
    }
    consola.debug(`[llms] Copied ${colors.dim(posts.length.toString())} raw .md files to dist/`)
  }

  s.succeed(`llms.txt generated. (${posts.length} posts)`)
}

/**
 * Read and filter posts for llms output
 */
async function getLlmsPosts(
  params: { files: string[], lang: string },
  options: ResolvedValaxyOptions,
): Promise<LlmsPost[]> {
  const { files, lang } = params

  const posts: LlmsPost[] = []

  for (const file of files) {
    const raw = await readFile(file, 'utf-8')
    const { data, content } = matter(raw, matterOptions)

    // Skip encrypted, draft, and hidden posts
    if (data.password || data.draft || data.hide)
      continue

    const relativePath = path.relative(path.join(options.userRoot, 'pages'), file)
    const urlPath = `/${relativePath.replace(/\\/g, '/').replace(/\.md$/, '')}`

    posts.push({
      title: tObject(data.title, lang) || path.basename(file, '.md'),
      description: tObject(data.description, lang) || '',
      date: data.date ? new Date(data.date) : new Date(0),
      urlPath,
      content,
    })
  }

  return posts
}

/**
 * Generate the llms.txt index file content following the llms.txt standard.
 * @see https://llmstxt.org/
 */
function generateLlmsTxt(params: {
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
    const mdUrl = siteUrl === '/'
      ? `${post.urlPath}.md`
      : `${siteUrl}${post.urlPath}.md`
    const desc = post.description ? `: ${post.description}` : ''
    lines.push(`- [${post.title}](${mdUrl})${desc}`)
  }
  lines.push('')

  return lines.join('\n')
}

/**
 * Generate the llms-full.txt file with all post content inlined.
 */
function generateLlmsFullTxt(params: {
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
