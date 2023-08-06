import { dirname } from 'node:path'
import { cyan, dim } from 'kolorist'

import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { Author, FeedOptions, Item } from 'feed'
import { Feed } from 'feed'
import consola from 'consola'
import type { ResolvedValaxyOptions } from './options'
import { getCreatedTime, getUpdatedTime } from './utils/date'
import { ensurePrefix, isExternal } from './utils'
import { EXCERPT_SEPARATOR } from './constants'

const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

/**
 * generate rss
 * @param options
 * @returns
 */
export async function build(options: ResolvedValaxyOptions) {
  const { config } = options
  const siteConfig = config.siteConfig

  if (!siteConfig.url || siteConfig.url === '/') {
    consola.error('You must set `url` (like `https://example.com`) in `site.config.ts` to generate rss.')
    return
  }

  // url has been ensured '/'
  const siteUrl = siteConfig.url
  const DOMAIN = siteConfig.url.slice(0, -1)

  const author: Author = {
    name: siteConfig.author?.name,
    email: siteConfig.author?.email,
    link: siteConfig.author?.link,
  }

  consola.info(`RSS Site Url: ${cyan(siteUrl)}`)

  const ccVersion = (siteConfig.license?.type === 'zero') ? '1.0' : '4.0'
  const feedOptions: FeedOptions = {
    title: siteConfig.title || 'Valaxy Blog',
    description: siteConfig.description,
    id: siteUrl || 'valaxy',
    link: siteUrl,
    copyright: `CC ${siteConfig.license?.type?.toUpperCase()} ${ccVersion} ${new Date().getFullYear()} © ${siteConfig.author?.name}`,
    feedLinks: {
      json: `${siteUrl}feed.json`,
      atom: `${siteUrl}feed.atom`,
      rss: `${siteUrl}feed.xml`,
    },
  }

  // generate
  const files = await fg(`${options.userRoot}/pages/posts/**/*.md`)

  const posts: Item[] = []
  for await (const i of files) {
    const raw = fs.readFileSync(i, 'utf-8')

    const { data, content, excerpt } = matter(raw, { excerpt_separator: EXCERPT_SEPARATOR })

    // skip encrypt post
    if (data.password)
      continue

    if (data.draft) {
      consola.warn(`Ignore draft post: ${dim(i)}`)
      continue
    }

    // hidden
    if (data.hide)
      continue

    const path = i
    if (!data.date)
      data.date = await getCreatedTime(path)
    if (siteConfig.lastUpdated) {
      if (!data.updated)
        data.updated = await getUpdatedTime(path)
    }

    // todo i18n

    // render excerpt
    // default excerpt content length: 100
    const html = markdown.render(excerpt || content.slice(0, 100))
      .replace('src="/', `src="${DOMAIN}/`)

    if (data.image?.startsWith('/'))
      data.image = DOMAIN + data.image

    posts.push({
      title: '',
      ...data,
      id: (data.id || '').toString(),
      date: new Date(data.date),
      published: new Date(data.updated || data.date),
      content: html,
      author: [author],
      link: DOMAIN + i.replace(`${options.userRoot}/pages`, '').replace(/\.md$/, ''),
    })
  }

  // sort by updated
  posts.sort((a, b) => +new Date(b.published || b.date) - +new Date(a.published || a.date))
  // await writeFeed('feed', feedOptions, posts)

  // write
  const authorAvatar = siteConfig.author?.avatar || '/favicon.svg'
  feedOptions.author = author
  feedOptions.image = isExternal(authorAvatar)
    ? siteConfig.author?.avatar
    : `${DOMAIN}${ensurePrefix('/', authorAvatar)}`
  feedOptions.favicon = `${DOMAIN}${siteConfig.feed?.favicon || siteConfig.favicon}`

  const feed = new Feed(feedOptions)
  posts.forEach(item => feed.addItem(item))
  // items.forEach(i=> console.log(i.title, i.date))

  await fs.ensureDir(dirname(`./dist/${siteConfig.feed?.name} || 'feed.xml'`))
  const path = './dist'

  const types = ['xml', 'atom', 'json']
  types.forEach((type) => {
    let data = ''
    let name = `${path}/${siteConfig.feed?.name || 'feed'}.${type}`
    if (type === 'xml') {
      data = feed.rss2()
    }
    else if (type === 'atom') {
      if (!siteConfig.feed?.name)
        name = `${path}/atom.xml`
      data = feed.atom1()
    }
    else if (type === 'json') {
      data = feed.json1()
    }
    fs.writeFileSync(name, data, 'utf-8')
    consola.info(`${type}: ${name}`)
  })
}
