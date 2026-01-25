import type { Author, FeedOptions, Item } from 'feed'
import type { ResolvedValaxyOptions } from '../../types'
import { readFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { ensurePrefix } from '@antfu/utils'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import { Feed } from 'feed'

import fs from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

import ora from 'ora'
import { getBorderCharacters, table } from 'table'
import { tObject } from '../../../shared'
import { matterOptions } from '../../plugins/markdown/transform/matter'
import { isExternal } from '../../utils'
import { getCreatedTime, getUpdatedTime } from '../../utils/date'

// Extend Item type to include optional updated field for Atom feed
type ExtendedItem = Item & { updated?: Date }

const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

/**
 * Extract image paths from built HTML file
 * Returns a map of original paths to built asset paths
 */
async function extractImagePathsFromHTML(htmlPath: string, DOMAIN: string): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>()

  try {
    if (!await fs.exists(htmlPath))
      return imageMap

    const html = await fs.readFile(htmlPath, 'utf-8')

    // Match all img tags with src containing assets/
    // e.g., <img src="/assets/test.zBFFFKJX.webp" alt="pic">
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
    let match: RegExpExecArray | null

    // eslint-disable-next-line no-cond-assign
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1]
      // Extract the filename from the asset path
      // /assets/test.zBFFFKJX.webp -> test (without hash and extension)
      // Support both single-part and multi-part filenames (e.g., bg-img)
      const assetMatch = src.match(/\/assets\/(.+)\.([a-zA-Z0-9]+)\.([a-z0-9]+)$/)
      if (assetMatch) {
        const [, basename, , ext] = assetMatch
        // Map original filename to full URL
        // test.webp -> https://domain/assets/test.zBFFFKJX.webp
        // bg-img.jpg -> https://domain/assets/bg-img.kXdNMxcF.jpg
        const originalName = `${basename}.${ext}`
        imageMap.set(originalName, `${DOMAIN}${src}`)
        imageMap.set(`./${originalName}`, `${DOMAIN}${src}`)
        consola.debug(`[RSS] Mapped image: ${originalName} -> ${DOMAIN}${src}`)
      }
    }
    if (imageMap.size > 0) {
      const uniqueImageCount = imageMap.size / 2
      consola.info(`[RSS] Extracted ${uniqueImageCount} image(s) from ${htmlPath}`)
    }
  }
  catch (error) {
    consola.debug(`Failed to extract image paths from ${htmlPath}:`, error)
  }

  return imageMap
}

/**
 * generate rss
 * @param options
 */
export async function build(options: ResolvedValaxyOptions) {
  // consola.info(`${yellow('RSS Generating ...')}`)
  const s = ora('RSS Generating ...').start()

  const { config } = options
  const siteConfig = config.siteConfig
  const lang = siteConfig.lang || 'en'

  if (!siteConfig.url || siteConfig.url === '/') {
    consola.error('You must set `url` (like `https://example.com`) in `site.config.ts` to generate rss.')
    return
  }

  // url has been ensured '/'
  const siteUrl = siteConfig.url

  const author: Author = {
    name: siteConfig.author?.name,
    email: siteConfig.author?.email,
    link: siteConfig.author?.link,
  }

  const ccVersion = (siteConfig.license?.type === 'zero') ? '1.0' : '4.0'
  const feedNameMap: Record<string, string> = {
    atom: siteConfig.feed?.name ? `${siteConfig.feed?.name}.atom` : 'atom.xml',
    json: `${siteConfig.feed?.name || 'feed'}.json`,
    rss: `${siteConfig.feed?.name || 'feed'}.xml`,
  }

  const feedLinks: FeedOptions['feedLinks'] = {}
  Object.keys(feedNameMap).forEach((key) => {
    feedLinks[key] = `${siteUrl}${feedNameMap[key]}`
  })
  const title = tObject(siteConfig.title, lang)
  const description = tObject(siteConfig.description, lang)
  const feedOptions: FeedOptions = {
    title: title || 'Valaxy Blog',
    description,
    id: siteUrl || 'valaxy',
    link: siteUrl,
    copyright: `CC ${siteConfig.license?.type?.toUpperCase()} ${ccVersion} ${new Date().getFullYear()} © ${siteConfig.author?.name}`,
    feedLinks,
  }

  const DOMAIN = siteConfig.url.slice(0, -1)

  // generate
  const files = await fg(`${options.userRoot}/pages/posts/**/*.md`)
  const posts = await getPosts({
    author,
    files,
    DOMAIN,
  }, options)

  if (!posts)
    return

  // write
  const authorAvatar = siteConfig.author?.avatar || '/favicon.svg'
  feedOptions.author = author
  feedOptions.image = isExternal(authorAvatar)
    ? siteConfig.author?.avatar
    : `${DOMAIN}${ensurePrefix('/', authorAvatar)}`
  feedOptions.favicon = `${DOMAIN}${siteConfig.feed?.favicon || siteConfig.favicon}`

  s.succeed('RSS Generated.')
  await writeFeed(feedOptions, posts, options, feedNameMap)
}

/**
 * get posts from files
 */
export async function getPosts(params: {
  author: Author
  files: string[]
  DOMAIN: string
}, options: ResolvedValaxyOptions) {
  const { config } = options
  const siteConfig = config.siteConfig
  const lang = siteConfig.lang || 'en'

  const { files, author, DOMAIN } = params

  // read file & matter
  const readFilePromises = files.map(async (i) => {
    const raw = await readFile(i, 'utf-8')
    const { data, content, excerpt } = matter(raw, matterOptions)
    return { data, content, excerpt, path: i }
  })
  const draftPosts: {
    data: Record<string, any>
    content: string
    excerpt?: string
    path: string
  }[] = []
  const rawPosts = (await Promise.all(readFilePromises))
  // filter
  const filteredPosts = rawPosts.filter((p) => {
    const { data } = p
    // skip encrypt post
    if (data.password)
      return false
      // skip draft post
    if (data.draft) {
      // TODO: console draftPosts
      draftPosts.push(p)
      return false
    }
    // skip hidden post
    if (data.hide)
      return false
    return true
  })

  // returned posts
  const posts: ExtendedItem[] = []
  for (const rawPost of filteredPosts) {
    const { data, path, content, excerpt } = rawPost
    if (!data.date)
      data.date = await getCreatedTime(path)
    if (siteConfig.lastUpdated) {
      if (!data.updated)
        data.updated = await getUpdatedTime(path)
    }

    // todo i18n

    // render excerpt
    // default excerpt content length: 100
    const fullText = options.config.modules.rss.fullText
    const rssContent = fullText ? content : (excerpt || content.slice(0, 100))

    // Use relative path to correctly handle cross-platform file paths
    const relativePath = relative(join(options.userRoot, 'pages'), path)
    // Convert Windows backslashes to forward slashes for URL
    const urlPath = relativePath.replace(/\\/g, '/').replace(/\.md$/, '')
    const link = `${DOMAIN}/${urlPath}`

    // Extract image paths from built HTML if enabled
    const extractImages = options.config.modules.rss.extractImagePathsFromHTML
    let imageMap = new Map<string, string>()

    if (extractImages) {
      // Try to load the built HTML file to get actual asset paths
      // Handle both /posts/xxx/index.md -> /posts/xxx.html and /posts/xxx.md -> /posts/xxx.html
      let htmlPath = resolve(options.userRoot, 'dist', `${urlPath}.html`)
      if (urlPath.endsWith('/index')) {
        // For pages/posts/xxx/index.md, try posts/xxx.html first
        const withoutIndex = urlPath.slice(0, -6) // Remove '/index'
        const alternativePath = resolve(options.userRoot, 'dist', `${withoutIndex}.html`)
        if (await fs.exists(alternativePath)) {
          htmlPath = alternativePath
        }
      }
      imageMap = await extractImagePathsFromHTML(htmlPath, DOMAIN)
    }

    let html = markdown.render(rssContent)

    // Replace image paths with actual built asset URLs
    html = html.replace(/src="([^"]+)"/g, (_fullMatch, src) => {
      // Check if we have a mapping for this image
      if (imageMap.has(src)) {
        return `src="${imageMap.get(src)}"`
      }
      // Handle absolute URLs (already complete)
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return _fullMatch
      }
      // Handle absolute paths starting with /
      if (src.startsWith('/')) {
        return `src="${DOMAIN}${src}"`
      }
      // Handle relative paths (./ or direct filename)
      const postDirUrl = `${DOMAIN}/${urlPath.split('/').slice(0, -1).join('/')}`
      const cleanSrc = src.startsWith('./') ? src.slice(2) : src
      return `src="${postDirUrl}/${cleanSrc}"`
    })

    if (data.image?.startsWith('/'))
      data.image = DOMAIN + data.image

    const tip = `<br/><p>${
      lang === 'zh-CN'
        ? `访问 <a href="${link}" target="_blank">${link}</a> ${fullText ? '查看原文' : '阅读全文'}。`
        : `Visit <a href="${link}" target="_blank">${link}</a> to ${fullText ? 'view original article' : 'read more'}.`
    }</p>`

    // RSS/Atom/JSON Feed time fields mapping:
    // - RSS 2.0: only uses `date` -> <pubDate>
    // - Atom (RFC 4287): uses `published` (optional) and `updated` (required)
    // - JSON Feed: uses `date_published` and `date_modified`
    const item: ExtendedItem = {
      ...data,
      title: tObject(data.title, lang),
      description: tObject(data.description, lang),
      date: new Date(data.date), // RSS pubDate / JSON date_published
      published: new Date(data.date), // Atom published (first publish time)
      content: html + tip,
      author: [author],
      id: data.id || link,
      link,
      // Add updated field for Atom feed (if exists)
      // Atom: <updated> (last modified time)
      // JSON Feed: date_modified
      ...(data.updated && { updated: new Date(data.updated) }),
    }

    posts.push(item)
  }

  // sort by siteConfig.orderBy
  const orderBy = siteConfig.orderBy || 'date'
  const useUpdatedTime = orderBy === 'updated'
  posts.sort((a, b) => {
    // when orderBy is 'updated', use updated time (fallback to date)
    // when orderBy is 'date', use publish date
    const aTime = useUpdatedTime ? (a.updated || a.date) : a.date
    const bTime = useUpdatedTime ? (b.updated || b.date) : b.date
    return +bTime - +aTime
  })
  return posts
}

/**
 * write feed to local
 */
export async function writeFeed(feedOptions: FeedOptions, posts: ExtendedItem[], options: ResolvedValaxyOptions, feedNameMap: Record<string, string>) {
  const feed = new Feed(feedOptions)
  // Feed.addItem accepts Item, ExtendedItem is compatible
  posts.forEach(item => feed.addItem(item))

  await fs.ensureDir(dirname(`./dist/${feedNameMap.atom}`))
  const path = resolve(options.userRoot, './dist')
  const publicFolder = resolve(options.userRoot, 'public')

  const { config } = options
  const siteConfig = config.siteConfig
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss zzz')
  const tableData = [
    [`${colors.yellow('RSS Feed Files')} 📡 ${colors.dim(now)}`, '', ''],
    [colors.bold('Site Url'), '', colors.cyan(siteConfig.url)],
    ['Type', 'Folder', 'Path'],
  ]

  const types = ['rss', 'atom', 'json']
  for (const type of types) {
    let data = ''
    const distFeedPath = `${path}/${feedNameMap[type]}`
    if (type === 'rss')
      data = feed.rss2()
    else if (type === 'atom')
      data = feed.atom1()
    else if (type === 'json')
      data = feed.json1()

    await fs.writeFile(distFeedPath, data, 'utf-8')
    consola.debug(`[${colors.cyan(type)}] dist: ${colors.dim(distFeedPath)}`)
    tableData.push([colors.cyan(type), colors.yellow('dist'), colors.dim(distFeedPath)])

    const publicFeedPath = resolve(publicFolder, feedNameMap[type])
    const publicRelativeFile = join('public', feedNameMap[type])
    await fs.writeFile(publicFeedPath, data, 'utf-8')
    consola.debug(`[${colors.cyan(type)}] public: ${colors.dim(publicFeedPath)}`)
    tableData.push(['', colors.green('public'), colors.dim(publicFeedPath)])

    try {
      const gitignorePath = resolve(options.userRoot, '.gitignore')
      const gitignore = await fs.readFile(gitignorePath, 'utf-8')
      const ignorePath = publicRelativeFile.replace(/\\/g, '/')
      if (!gitignore.includes(ignorePath)) {
        await fs.appendFile(gitignorePath, `\n# valaxy rss\n${ignorePath}\n`)
        consola.success(`Add ${colors.dim(ignorePath)} to ${colors.dim('.gitignore')}`)
      }
    }
    catch {}
  }
  // eslint-disable-next-line no-console
  console.log(table(tableData, {
    columns: [
      { alignment: 'center' },
      { alignment: 'right' },
      { alignment: 'left' },
    ],
    spanningCells: [
      { col: 0, row: 0, colSpan: 3 },
      { col: 0, row: 1, colSpan: 2 },
      { col: 0, row: 3, rowSpan: 2, verticalAlignment: 'middle' },
      { col: 0, row: 5, rowSpan: 2, verticalAlignment: 'middle' },
      { col: 0, row: 7, rowSpan: 2, verticalAlignment: 'middle' },
    ],
    border: getBorderCharacters('norc'),
  }))
}
