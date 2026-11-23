import type { Author, FeedOptions, Item } from 'feed'
import type { ResolvedValaxyOptions } from '../../types'
import { readFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import matter from '@11ty/gray-matter'
import { ensurePrefix } from '@antfu/utils'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import dayjs from 'dayjs'
import { Feed } from 'feed'
import fs from 'fs-extra'
import { createMarkdownExit } from 'markdown-exit'
import pMap from 'p-map'
import { getBorderCharacters, table } from 'table'
import { glob } from 'tinyglobby'

import { tObject } from '../../../shared'
import { isUnpublishedPage, relativePagePath } from '../../../shared/page-policy'
import { feedFileNames, plainSeoDescription, publicAuthor, stripEncryptedContent } from '../../../shared/seo'
import { EXCERPT_SEPARATOR } from '../../constants'
import { matterOptions } from '../../plugins/markdown/transform/matter'
import { isExternal } from '../../utils'
import { resolveBuildPaths } from '../../utils/buildConfig'
import { getCreatedTime, getUpdatedTime } from '../../utils/date'
import { getGitTimestampCache } from '../../utils/getGitTimestamp'
import { discoverPageFiles, getPagePath, pagePathToRoute } from '../../utils/pageSources'
import { findBuiltAsset, readBuiltAssetUrls, readLegacyImageUrls, rewriteSourceAttributes } from './assets'

// Extend Item type to include optional updated field for Atom feed
type ExtendedItem = Item & { updated?: Date }

const markdown = createMarkdownExit({
  html: true,
  breaks: true,
  linkify: true,
})

/**
 * generate rss
 * @param options
 */
export async function build(options: ResolvedValaxyOptions) {
  consola.start('RSS Generating ...')

  const { config } = options
  const siteConfig = config.siteConfig
  const lang = siteConfig.lang || 'en'

  if (!siteConfig.url || siteConfig.url === '/') {
    consola.error('You must set `url` (like `https://example.com`) in `site.config.ts` to generate rss.')
    return
  }

  // url has been ensured '/'
  const siteUrl = siteConfig.url

  const author: Author = publicAuthor(siteConfig.author)

  const ccVersion = (siteConfig.license?.type === 'zero') ? '1.0' : '4.0'
  const feedNameMap = feedFileNames(siteConfig.feed?.name)

  const feedLinks: FeedOptions['feedLinks'] = {}
  for (const key of ['rss', 'atom', 'json'] as const)
    feedLinks[key] = `${siteUrl}${feedNameMap[key]}`
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

  // generate: only include generated loader content when content loaders are active
  const files = options.config.loaders?.length
    ? [...(await discoverPageFiles(options.userRoot, ['posts/**/*.md'])).values()]
    : await glob('pages/posts/**/*.md', { cwd: options.userRoot, absolute: true, onlyFiles: true })
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

  consola.success('RSS Generated.')
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

  // read file & matter with bounded concurrency
  const rawPosts = await pMap(files, async (i) => {
    const raw = await readFile(i, 'utf-8')
    const { data, content, excerpt } = matter(raw, matterOptions)
    const frontmatter: Record<string, any> = { ...siteConfig.frontmatter, ...data }
    return { data: frontmatter, content, excerpt, path: i }
  }, { concurrency: 20 })
  // filter
  const draftPosts: string[] = []
  const filteredPosts = rawPosts.filter((p) => {
    const { data } = p
    // skip encrypt post
    if (data.password || data.encrypt === true)
      return false
    const relative = relativePagePath(p.path, options.userRoot)
    if (relative && isUnpublishedPage(relative, siteConfig.publishing))
      return false
    // skip draft post unless the site opts in
    if (data.draft && !siteConfig.publishing?.drafts) {
      draftPosts.push(p.path)
      return false
    }
    // skip hidden post
    if (data.hide)
      return false
    return true
  })
  if (draftPosts.length) {
    consola.warn(`[rss] Skipped ${colors.yellow(String(draftPosts.length))} draft post(s):\n${
      draftPosts.map(p => `  ${colors.dim('-')} ${colors.dim(p)}`).join('\n')
    }`)
  }

  // returned posts
  const gitTimestampCache = getGitTimestampCache(options)
  const posts: ExtendedItem[] = []
  const siteUrl = `${DOMAIN}/`
  const { outDir } = resolveBuildPaths(options)
  const extractImages = options.config.modules.rss.extractImagePathsFromHTML
  const builtAssets = extractImages ? await readBuiltAssetUrls(options, outDir, siteUrl) : undefined
  for (const rawPost of filteredPosts) {
    const { data, path } = rawPost
    const content = stripEncryptedContent(rawPost.content)
    const excerpt = content.includes(EXCERPT_SEPARATOR) ? content.split(EXCERPT_SEPARATOR)[0] : ''
    const description = tObject(data.description, lang)
    const manualExcerpt = tObject(data.excerpt, lang)
    const summaryLength = siteConfig.excerpt?.length || 200
    if (!data.date)
      data.date = await getCreatedTime(path, gitTimestampCache)
    if (siteConfig.lastUpdated) {
      if (!data.updated)
        data.updated = await getUpdatedTime(path, gitTimestampCache)
    }
    // render excerpt
    // default excerpt content length: 100
    const fullText = options.config.modules.rss.fullText
    const rssContent = fullText ? content : (excerpt || content.slice(0, 100))

    // Use relative path to correctly handle cross-platform file paths
    const relativePath = getPagePath(path, options.userRoot) || relative(join(options.userRoot, 'pages'), path).replace(/\\/g, '/')
    const urlPath = pagePathToRoute(relativePath)
    const link = `${DOMAIN}/${urlPath}`

    let legacyImages: Awaited<ReturnType<typeof readLegacyImageUrls>> | undefined
    if (extractImages && !builtAssets) {
      let htmlPath = resolve(outDir, `${urlPath}.html`)
      if (!await fs.pathExists(htmlPath) && relativePath.endsWith('/index.md'))
        htmlPath = resolve(outDir, urlPath, 'index.html')
      legacyImages = await readLegacyImageUrls(htmlPath, siteUrl)
    }

    const html = rewriteSourceAttributes(markdown.render(rssContent), (src, isImage) => {
      if (!src || /^(?:\/\/|#|[a-z][\w+.-]*:)/i.test(src))
        return
      if (src.startsWith('/'))
        return `${DOMAIN}${src}`

      if (isImage) {
        const pathname = src.split(/[?#]/, 1)[0]
        const mapped = builtAssets
          ? findBuiltAsset(pathname, path, options.userRoot, builtAssets)
          : legacyImages?.get(pathname.replace(/^\.\//, ''))
        if (mapped)
          return mapped + src.slice(pathname.length)
      }

      const postDir = relativePath.split('/').slice(0, -1).join('/')
      const postDirUrl = postDir ? `${DOMAIN}/${postDir}` : DOMAIN
      const cleanSrc = src.startsWith('./') ? src.slice(2) : src
      return `${postDirUrl}/${cleanSrc}`
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
      description: typeof description === 'string' && description.trim()
        ? description
        : plainSeoDescription(typeof manualExcerpt === 'string' ? manualExcerpt : '', summaryLength)
          || plainSeoDescription(excerpt || content, summaryLength),
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
export async function writeFeed(feedOptions: FeedOptions, posts: ExtendedItem[], options: ResolvedValaxyOptions, feedNameMap: ReturnType<typeof feedFileNames>) {
  const feed = new Feed(feedOptions)
  // Feed.addItem accepts Item, ExtendedItem is compatible
  posts.forEach(item => feed.addItem(item))

  const { outDir: distDir, publicDir: publicFolder } = resolveBuildPaths(options)
  await fs.ensureDir(distDir)
  if (publicFolder !== false)
    await fs.ensureDir(publicFolder)
  const outLabel = basename(distDir) || 'dist'

  const { config } = options
  const siteConfig = config.siteConfig
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss zzz')
  const tableData = [
    [`${colors.yellow('RSS Feed Files')} 📡 ${colors.dim(now)}`, '', ''],
    [colors.bold('Site Url'), '', colors.cyan(siteConfig.url)],
    ['Type', 'Folder', 'Path'],
  ]

  const types = ['rss', 'atom', 'json'] as const
  for (const type of types) {
    let data = ''
    const distFeedPath = `${distDir}/${feedNameMap[type]}`
    if (type === 'rss')
      data = feed.rss2()
    else if (type === 'atom')
      data = feed.atom1()
    else if (type === 'json')
      data = feed.json1()

    await fs.ensureDir(dirname(distFeedPath))
    await fs.writeFile(distFeedPath, data, 'utf-8')
    consola.debug(`[${colors.cyan(type)}] dist: ${colors.dim(distFeedPath)}`)
    tableData.push([colors.cyan(type), colors.yellow(outLabel), colors.dim(distFeedPath)])

    if (publicFolder !== false) {
      const publicFeedPath = resolve(publicFolder, feedNameMap[type])
      const publicRelativeFile = relative(options.userRoot, publicFeedPath).replace(/\\/g, '/')
      await fs.ensureDir(dirname(publicFeedPath))
      await fs.writeFile(publicFeedPath, data, 'utf-8')
      consola.debug(`[${colors.cyan(type)}] public: ${colors.dim(publicFeedPath)}`)
      tableData.push(['', colors.green('public'), colors.dim(publicFeedPath)])

      if (publicRelativeFile && !publicRelativeFile.startsWith('..')) {
        try {
          const gitignorePath = resolve(options.userRoot, '.gitignore')
          const gitignore = await fs.readFile(gitignorePath, 'utf-8')
          if (!gitignore.includes(publicRelativeFile)) {
            await fs.appendFile(gitignorePath, `\n# valaxy rss\n${publicRelativeFile}\n`)
            consola.success(`Add ${colors.dim(publicRelativeFile)} to ${colors.dim('.gitignore')}`)
          }
        }
        catch {}
      }
    }
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
