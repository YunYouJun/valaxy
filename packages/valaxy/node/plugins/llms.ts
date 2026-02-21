import type { Plugin } from 'vite'
import type { LlmsPost } from '../modules/llms/utils'
import type { ResolvedValaxyOptions } from '../types'
import { Buffer } from 'node:buffer'
import path from 'node:path'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { loadLocalesYml } from '../../shared/node/i18n'
import { generateLlmsFullTxt, generateLlmsTxt, resolveText } from '../modules/llms/utils'
import { filePathToUrlPath, filterPublicPosts, getSiteUrl, readPostFiles, scanPostFiles } from '../modules/utils'
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

          // Serve /posts/**/*.md raw files
          if (llmsConfig.files && url.startsWith('/posts/') && url.endsWith('.md')) {
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

/**
 * Generate llms.txt index content from current posts.
 */
async function buildLlmsTxt(options: ResolvedValaxyOptions): Promise<string> {
  const { config } = options
  const siteConfig = config.siteConfig
  const lang = siteConfig.lang || 'en'
  const siteUrl = getSiteUrl(options)

  const posts = await collectPosts(options, lang)
  const title = resolveText(siteConfig.title, lang) || 'Valaxy Blog'
  const description = resolveText(siteConfig.description, lang)

  return generateLlmsTxt({
    title,
    description,
    prompt: siteConfig.llms.prompt,
    posts,
    siteUrl,
  })
}

/**
 * Generate llms-full.txt content from current posts.
 */
async function buildLlmsFullTxt(options: ResolvedValaxyOptions): Promise<string> {
  const { config } = options
  const siteConfig = config.siteConfig
  const lang = siteConfig.lang || 'en'

  const posts = await collectPosts(options, lang)
  const title = resolveText(siteConfig.title, lang) || 'Valaxy Blog'
  const description = resolveText(siteConfig.description, lang)

  return generateLlmsFullTxt({
    title,
    description,
    prompt: siteConfig.llms.prompt,
    posts,
  })
}

/**
 * Scan, read, filter, and sort posts into LlmsPost[].
 */
async function collectPosts(options: ResolvedValaxyOptions, lang: string): Promise<LlmsPost[]> {
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

  posts.sort((a, b) => +b.date - +a.date)
  return posts
}

/**
 * Resolve a URL like `/posts/hello.md` to raw markdown content (no frontmatter).
 *
 * Checks both `pages/posts/hello.md` and `pages/posts/hello/index.md`.
 * Returns `null` if not found or post is draft/hidden/encrypted.
 */
async function resolveRawMd(url: string, options: ResolvedValaxyOptions): Promise<string | null> {
  const pagesDir = path.resolve(options.userRoot, 'pages')
  // Strip leading slash and resolve against pagesDir
  const safePath = path.resolve(pagesDir, url.slice(1))
  // Prevent path traversal: resolved path must stay within pagesDir
  if (!safePath.startsWith(pagesDir + path.sep))
    return null

  // url is e.g. `/posts/hello.md` → try `pages/posts/hello.md`
  const directPath = safePath
  // Also try index form: `/posts/hello.md` → `pages/posts/hello/index.md`
  const stem = safePath.slice(0, -'.md'.length)
  const indexPath = path.join(stem, 'index.md')

  let filePath: string | null = null
  if (await fs.pathExists(directPath))
    filePath = directPath
  else if (await fs.pathExists(indexPath))
    filePath = indexPath

  if (!filePath)
    return null

  const raw = await fs.readFile(filePath, 'utf-8')
  const { data, content } = matter(raw, matterOptions)

  // Filter out draft/hidden/encrypted posts
  if (data.password || data.draft || data.hide)
    return null

  return content
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
