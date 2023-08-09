import fs from 'fs-extra'
import { type ResolvedValaxyOptions } from 'valaxy'
import { ensurePrefix } from '@antfu/utils'
import consola from 'consola'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { cyan, dim } from 'kolorist'
import type { Argv } from 'yargs'

import type { FuseListItem } from 'valaxy/types'
import { resolveOptions } from '../options'
import { setEnvProd } from '../utils/env'
import { commonOptions } from './options'

/**
 * @description Generate Fuse List Data for Search
 * @param options
 * @returns
 */
export async function generateFuseList(options: ResolvedValaxyOptions) {
  consola.start(`Generate List for Fuse Search by (${cyan('fuse.js')}) ...`)
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

    // skip encrypt post
    if (data.password)
      continue

    const keys = options.config.siteConfig.fuse.options.keys || []
    const fuseListItem: FuseListItem = {
      title: data.title || '',
      tags: (typeof data.tags === 'string' ? [data.tags] : data.tags) || [],
      categories: data.categories || [],
      author: options.config.siteConfig.author.name,
      excerpt: excerpt || content.slice(0, 100),
      // encode for chinese url
      link: encodeURI(i.replace(`${options.userRoot}/pages`, '').replace(/\.md$/, '')),
    }
    if (keys.includes('content'))
      fuseListItem.content = content || ''

    posts.push(fuseListItem)
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
      consola.info('Please generate it before build.')

      setEnvProd()
      const options = await resolveOptions({ userRoot: root }, 'build')
      const fuseList = await generateFuseList(options)

      await fs.ensureDir('./dist')
      const dataPath = ensurePrefix(options.config.siteConfig.fuse.dataPath, '/')
      const publicRelativeFolder = `public${dataPath}`
      const publicFolder = `${options.userRoot}/${publicRelativeFolder}`

      await fs.ensureFile(publicFolder)
      fs.writeJSONSync(publicFolder, fuseList)
      consola.success(`Generate fuse list in ${dim(publicFolder)}`)

      try {
        const gitignore = await fs.readFile(`${options.userRoot}/.gitignore`, 'utf-8')
        const publicRelativeFolder = `public${dataPath}`
        if (!gitignore.includes(publicRelativeFolder)) {
          await fs.appendFile(`${options.userRoot}/.gitignore`, `\n# valaxy\n${publicRelativeFolder}\n`)
          consola.success(`Add ${dim(dataPath)} to ${dim('.gitignore')}`)
        }
      }
      catch {}
    },
  )
}
