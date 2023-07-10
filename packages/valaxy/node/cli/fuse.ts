import fs from 'fs-extra'
import type { ResolvedValaxyOptions } from 'valaxy'
import consola from 'consola'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { cyan, dim } from 'kolorist'
import type { Argv } from 'yargs'
import { resolveOptions } from '../options'
import { setEnvProd } from '../utils/env'
import { commonOptions } from './options'

export interface FuseListItem {
  title: string
  excerpt: string
  author: string
  tags: string[]
  categories: string[]
  link: string
}

export async function generateFuseList(options: ResolvedValaxyOptions) {
  consola.info(`Generate List for Fuse Search by (${cyan('fuse.js')}) ...`)
  // generate
  const files = await fg(`${options.userRoot}/pages/posts/**/*.md`)

  const posts: FuseListItem[] = []
  for await (const i of files) {
    const raw = fs.readFileSync(i, 'utf-8')
    const { data, excerpt, content } = matter(raw, { excerpt_separator: '<!-- more -->' })

    if (data.draft) {
      consola.warn(`Ignore draft post: ${dim(i)}`)
      continue
    }

    if (data.hide)
      continue

    posts.push({
      title: data.title || '',
      tags: (typeof data.tags === 'string' ? [data.tags] : data.tags) || [],
      categories: data.categories || [],
      author: options.config.siteConfig.author.name,
      excerpt: excerpt || content.slice(0, 100),
      // encode for chinese url
      link: encodeURI(i.replace(`${options.userRoot}/pages`, '').replace(/\.md$/, '')),
    })
  }

  return posts
}

/**
 * valaxy fuse
 * @param cli
 */
export function registerFuseCommand(cli: Argv<object>) {
  cli.command(
    'fuse [root]',
    'generate fuse list for search',
    args => commonOptions(args)
      .strict()
      .help(),
    async ({ root }) => {
      setEnvProd()
      const options = await resolveOptions({ userRoot: root }, 'build')
      const fuseList = await generateFuseList(options)

      await fs.ensureDir('./dist')
      const target = `${options.userRoot}/dist/fuse-list.json`
      fs.writeJSONSync(target, fuseList)
      consola.info(`Generate fuse list in ${dim(target)}`)
    },
  )
}
