import { dirname, join, resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { cyan, dim, yellow } from 'picocolors'

import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { Author, FeedOptions, Item } from 'feed'
import { Feed } from 'feed'
import consola from 'consola'
import { getCreatedTime, getUpdatedTime } from '../utils/date'
import { matterOptions } from '../utils/matterOptions'
import { type ResolvedValaxyOptions, resolveOptions } from '../options'
import { ensurePrefix, isExternal } from '../utils'
import { commonOptions } from '../cli/options'
import { setEnvProd } from '../utils/env'
import { defineValaxyModule } from '.'

const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

/**
 * generate rss
 * @param options
 */
export async function build(options: ResolvedValaxyOptions) {
  consola.info(`${yellow('RSS Generating ...')}`)

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
  const feedNameMap: Record<string, string> = {
    atom: siteConfig.feed?.name ? `${siteConfig.feed?.name}.atom` : 'atom.xml',
    json: `${siteConfig.feed?.name || 'feed'}.json`,
    rss: `${siteConfig.feed?.name || 'feed'}.xml`,
  }

  const feedOptions: FeedOptions = {
    title: siteConfig.title || 'Valaxy Blog',
    description: siteConfig.description,
    id: siteUrl || 'valaxy',
    link: siteUrl,
    copyright: `CC ${siteConfig.license?.type?.toUpperCase()} ${ccVersion} ${new Date().getFullYear()} © ${siteConfig.author?.name}`,
    feedLinks: {},
  }
  Object.keys(feedNameMap).forEach((key) => {
    feedOptions.feedLinks[key] = `${siteUrl}${feedNameMap[key]}`
  })

  // generate
  const files = await fg(`${options.userRoot}/pages/posts/**/*.md`)

  const lang = options.config.siteConfig.lang || 'en'

  const posts: Item[] = []
  for await (const i of files) {
    const raw = await readFile(i, 'utf-8')

    const { data, content, excerpt } = matter(raw, matterOptions)

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
    const fullText = options.config.modules.rss.fullText
    const html = markdown.render(excerpt || fullText ? content : content.slice(0, 100))
      .replace('src="/', `src="${DOMAIN}/`)

    if (data.image?.startsWith('/'))
      data.image = DOMAIN + data.image

    const link = DOMAIN + i.replace(`${options.userRoot}/pages`, '').replace(/\.md$/, '')
    const tip = `<br/><p>${
      lang === 'zh-CN'
        ? `访问 <a href="${link}" target="_blank">${link}</a> ${fullText ? '查看原文' : '阅读全文'}。`
        : `Visit <a href="${link}" target="_blank">${link}</a> to ${fullText ? 'view original article' : 'read more'}.`
     }</p>`

    posts.push({
      title: '',
      ...data,
      date: new Date(data.date),
      published: new Date(data.updated || data.date),
      content: html + tip,
      author: [author],
      link,
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

  await fs.ensureDir(dirname(`./dist/${feedNameMap.atom}`))
  const path = resolve(options.userRoot, './dist')
  const publicFolder = resolve(options.userRoot, 'public')

  const types = ['rss', 'atom', 'json']
  types.forEach(async (type) => {
    let data = ''
    const name = `${path}/${feedNameMap[type]}`
    if (type === 'rss')
      data = feed.rss2()
    else if (type === 'atom')
      data = feed.atom1()
    else if (type === 'json')
      data = feed.json1()

    fs.writeFileSync(name, data, 'utf-8')
    consola.success(`[${cyan(type)}] dist: ${dim(name)}`)

    const publicFeedPath = resolve(publicFolder, feedNameMap[type])
    const publicRelativeFile = join('public', feedNameMap[type])
    fs.writeFileSync(publicFeedPath, data, 'utf-8')
    consola.success(`[${cyan(type)}] public: ${dim(name)}`)

    try {
      const gitignorePath = resolve(options.userRoot, '.gitignore')
      const gitignore = await fs.readFile(gitignorePath, 'utf-8')
      const ignorePath = publicRelativeFile.replace(/\\/g, '/')
      if (!gitignore.includes(ignorePath)) {
        await fs.appendFile(gitignorePath, `\n# valaxy rss\n${ignorePath}\n`)
        consola.success(`Add ${dim(ignorePath)} to ${dim('.gitignore')}`)
      }
    }
    catch {}
  })
}

export const rssModule = defineValaxyModule({
  /**
   * valaxy rss
   * @param cli
   */
  extendCli(cli) {
    cli.command(
      'rss [root]',
      'generate rss feed',
      args => commonOptions(args)
        .strict()
        .help(),
      async ({ root }) => {
        setEnvProd()
        const options = await resolveOptions({ userRoot: root }, 'build')
        await build(options)
      },
    )
  },

  setup(node) {
    node.hook('build:after', () => {
      // eslint-disable-next-line no-console
      console.log()
      build(node.options)
    })
  },
})
