import { dirname } from 'path'
import { cyan, dim } from 'kolorist'

import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { Author, FeedOptions, Item } from 'feed'
import { Feed } from 'feed'
import consola from 'consola'
import type { ResolvedValaxyOptions } from './options'
import { formatMdDate } from './utils/date'

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

  if (!config.url || config.url === '/') {
    consola.error('You must set `url` (like `https://example.com`) in `valaxy.config.ts` to generate rss.')
    return
  }

  // url has been ensured '/'
  const siteUrl = config.url
  const DOMAIN = config.url.slice(0, -1)

  const author: Author = {
    name: config?.author?.name,
    email: config?.author?.email,
    link: config?.author?.link,
  }

  consola.info(`RSS Site Url: ${cyan(siteUrl)}`)

  const ccVersion = (config.license?.type === 'zero') ? '1.0' : '4.0'
  const feedOptions: FeedOptions = {
    title: config.title || 'Valaxy Blog',
    description: config.description,
    id: siteUrl || 'valaxy',
    link: siteUrl,
    copyright: `CC ${config.license?.type?.toUpperCase()} ${ccVersion} ${new Date().getFullYear()} © ${config.author?.name}`,
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

    const { data, content, excerpt } = matter(raw, { excerpt_separator: '<!-- more -->' })

    if (data.draft) {
      consola.warn(`Ignore draft post: ${dim(i)}`)
      continue
    }

    await formatMdDate(data, i, config.date?.format, config.lastUpdated)

    // todo i18n

    // render excerpt
    const html = markdown.render(excerpt || content)
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
  feedOptions.author = author
  feedOptions.image = config.author?.avatar?.startsWith('http') ? config.author.avatar : `${DOMAIN}${config.author?.avatar}`
  feedOptions.favicon = `${DOMAIN}${config.feed?.favicon || config.favicon}`

  const feed = new Feed(feedOptions)
  posts.forEach(item => feed.addItem(item))
  // items.forEach(i=> console.log(i.title, i.date))

  await fs.ensureDir(dirname(`./dist/${config.feed?.name}`))
  const path = './dist'

  const types = ['xml', 'atom', 'json']
  types.forEach((type) => {
    let data = ''
    let name = `${path}/${config.feed?.name || 'feed'}.${type}`
    if (type === 'xml') { data = feed.rss2() }
    else if (type === 'atom') {
      if (!config.feed?.name)
        name = `${path}/atom.xml`
      data = feed.atom1()
    }
    else if (type === 'json') { data = feed.json1() }
    fs.writeFileSync(name, data, 'utf-8')
    consola.info(`${type}: ${name}`)
  })
}
