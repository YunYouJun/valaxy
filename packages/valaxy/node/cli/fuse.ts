import path from 'node:path'
import fs from 'fs-extra'
import type { ResolvedValaxyOptions } from 'valaxy'
import consola from 'consola'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { cyan, dim } from 'picocolors'
import type { Argv } from 'yargs'

import type { FuseListItem } from 'valaxy/types'
import { resolveOptions } from '../options'
import { setEnvProd } from '../utils/env'
import { defineValaxyModule } from '../modules'
import { commonOptions } from './options'

/**
 * @description Generate Fuse List Data for Search
 * @param options
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
      const publicFolder = path.resolve(options.userRoot, 'public')
      const publicFuseFile = path.resolve(publicFolder, options.config.siteConfig.fuse.dataPath)
      const publicRelativeFile = path.join('public', options.config.siteConfig.fuse.dataPath)

      await fs.ensureFile(publicFuseFile)
      fs.writeJSONSync(publicFuseFile, fuseList)
      consola.success(`Generate fuse list in ${dim(publicFolder)}`)

      // copy to dist
      const distFolder = path.resolve(options.userRoot, 'dist')
      const distFuseFile = path.resolve(distFolder, options.config.siteConfig.fuse.dataPath)
      await fs.ensureDir(distFolder)
      fs.writeJSONSync(distFuseFile, fuseList)
      consola.success(`Generate fuse list in ${dim(distFolder)}`)

      try {
        const gitignorePath = path.resolve(options.userRoot, '.gitignore')
        const gitignore = await fs.readFile(gitignorePath, 'utf-8')
        const ignorePath = publicRelativeFile.replace(/\\/g, '/')
        if (!gitignore.includes(ignorePath)) {
          await fs.appendFile(gitignorePath, `\n# valaxy fuse\n${ignorePath}\n`)
          consola.success(`Add ${dim(ignorePath)} to ${dim('.gitignore')}`)
        }
      }
      catch {}
    },
  )
}

export const fuseModule = defineValaxyModule({
  extendCli(cli) {
    registerFuseCommand(cli)
  },

  setup(node) {
    node.hook('build:before', () => {
      generateFuseList(node.options)
    })
  },
})
