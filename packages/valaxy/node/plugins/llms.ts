import type { Plugin } from 'vite'
import type { LlmsPost } from '../modules/llms/utils'
import type { ResolvedValaxyOptions } from '../types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import matter from '@11ty/gray-matter'
import fs from 'fs-extra'
import { loadLocalesYml } from '../../shared/node/i18n'
import { isUnpublishedPage, relativePagePath } from '../../shared/page-policy'
import { formatMetadataHeader, generateLlmsFullTxt, generateLlmsTxt, loadLlmsPosts, resolveText, stripSensitiveFrontmatter } from '../modules/llms/utils'
import { getSiteUrl } from '../modules/utils'
import { getPagePath, resolvePageFile } from '../utils/pageSources'
import { matterOptions } from './markdown/transform/matter'

/**
 * Vite plugin that serves llms.txt, llms-full.txt, and raw .md files
 * during dev mode so that `useCopyMarkdown()` and `/llms.txt` work
 * without running a full build.
 *
 * Content is generated on each request (always fresh, no disk writes).
 */
export function createLlmsPlugin(options: ResolvedValaxyOptions): Plugin | null {
  const llmsConfig = options.config.siteConfig.llms
  if (!llmsConfig.enable)
    return null

  // Load locales once at plugin creation time instead of per-request
  loadLocalesYml(path.resolve(options.userRoot, 'locales'))

  return {
    name: 'valaxy:llms-dev',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = req.url
          if (!url)
            return next()

          // Serve /llms.txt
          if (url === '/llms.txt') {
            const content = await buildLlmsTxt(options)
            return sendText(res, content, req.method === 'HEAD')
          }

          // Serve /llms-full.txt
          if (url === '/llms-full.txt' && llmsConfig.fullText) {
            const content = await buildLlmsFullTxt(options)
            return sendText(res, content, req.method === 'HEAD')
          }

          // Serve raw .md files for any page
          if (llmsConfig.files && url.endsWith('.md')) {
            const content = await resolveRawMd(url, options)
            if (content !== null)
              return sendText(res, content, req.method === 'HEAD')
          }

          next()
        }
        catch (err) {
          next(err)
        }
      })
    },
  }
}

/** Fields shared by the dev-server index and full-text responses. */
function llmsDocumentInput(options: ResolvedValaxyOptions, posts: LlmsPost[]) {
  const siteConfig = options.config.siteConfig
  const lang = siteConfig.lang || 'en'
  const llms = siteConfig.llms
  return {
    title: resolveText(siteConfig.title, lang) || 'Valaxy Blog',
    description: resolveText(siteConfig.description, lang),
    prompt: llms.prompt,
    posts,
    siteUrl: getSiteUrl(options),
    exclude: llms.exclude,
    locales: llms.locales,
    sectionOrder: llms.sectionOrder,
    featured: llms.featured,
    collapse: llms.collapse,
  }
}

/**
 * Generate llms.txt index content from current posts.
 */
async function buildLlmsTxt(options: ResolvedValaxyOptions): Promise<string> {
  const posts = await loadLlmsPosts(options)
  return generateLlmsTxt(llmsDocumentInput(options, posts))
}

/**
 * Generate llms-full.txt content from current posts.
 */
async function buildLlmsFullTxt(options: ResolvedValaxyOptions): Promise<string> {
  const posts = await loadLlmsPosts(options)
  return generateLlmsFullTxt(llmsDocumentInput(options, posts))
}

/**
 * Resolve a URL like `/posts/hello.md` or `/guide/getting-started.md` to raw markdown content (no frontmatter).
 *
 * Checks both `pages/{path}.md` and `pages/{path}/index.md`.
 * Returns `null` if not found or post is draft/hidden/encrypted.
 */
async function resolveRawMd(url: string, options: ResolvedValaxyOptions): Promise<string | null> {
  const page = url.slice(1)
  const filePath = resolvePageFile(page, options.userRoot)
    || resolvePageFile(`${page.slice(0, -3)}/index.md`, options.userRoot)

  if (!filePath)
    return null

  const raw = await fs.readFile(filePath, 'utf-8')
  const { data, content } = matter(raw, matterOptions)

  const publishing = options.config.siteConfig.publishing
  const relative = relativePagePath(filePath, options.userRoot)
  // Filter out draft/hidden/encrypted posts and unpublished paths.
  if (data.password || data.hide || (data.draft && !publishing?.drafts))
    return null
  if (relative && isUnpublishedPage(relative, publishing))
    return null

  // Build a LlmsPost object for metadata header generation
  const lang = options.config.siteConfig.lang || 'en'
  const urlPath = url.replace(/\.md$/, '')
  const cleanedFrontmatter = stripSensitiveFrontmatter(data)
  const post: LlmsPost = {
    title: resolveText(data.title, lang) || path.basename(filePath, '.md'),
    description: resolveText(data.description, lang) || '',
    date: data.date ? new Date(data.date) : new Date(0),
    urlPath,
    sourcePath: getPagePath(filePath, options.userRoot)!,
    content,
    rawFrontmatter: cleanedFrontmatter,
  }

  const header = formatMetadataHeader(post)
  const body = content.trim()
  return body ? `${header}${body}\n` : header
}

/**
 * Send a plain text response.
 */
function sendText(res: import('node:http').ServerResponse, content: string, headOnly: boolean) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(content))
  res.statusCode = 200

  if (headOnly) {
    res.end()
  }
  else {
    res.end(content)
  }
}
