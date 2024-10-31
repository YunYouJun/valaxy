import path from 'node:path'
import fs from 'fs-extra'
import type { ResolvedValaxyOptions } from 'valaxy'
import consola from 'consola'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { cyan, dim } from 'picocolors'
import type { Argv } from 'yargs'

import type { FuseListItem, PostFrontMatter } from 'valaxy/types'
import { matterOptions } from '../plugins/markdown/transform/matter'
import { resolveOptions } from '../options'
import { setEnvProd } from '../utils/env'
import { commonOptions } from '../cli/options'
import { defineValaxyModule } from '.'

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
    const { data, excerpt, content } = matter(raw, matterOptions)
    const fmData = data as PostFrontMatter

    if (fmData.draft) {
      consola.warn(`Ignore draft post: ${dim(i)}`)
      continue
    }

    if (fmData.hide)
      continue

    // skip encrypt post
    if (fmData.password)
      continue

    const extendKeys = options.config.fuse?.extendKeys || []

    // adapt for nested folders, like /posts/2021/01/01/index.md
    const relativeLink = i.replace(`${options.userRoot}/pages`, '')
    const link = i.endsWith('index.md')
      ? relativeLink.replace(/\/index\.md$/, '')
      : relativeLink.replace(/\.md$/, '')

    const fuseListItem: FuseListItem = {
      title: fmData.title || '',
      tags: (typeof fmData.tags === 'string' ? [fmData.tags] : fmData.tags) || [],
      categories: (typeof fmData.categories === 'string' ? [fmData.categories] : fmData.categories) || [],
      author: options.config.siteConfig.author.name,
      excerpt: excerpt || content.slice(0, 100),
      // encode for chinese url
      link: encodeURI(link),
    }

    extendKeys.forEach((key) => {
      fuseListItem[key] = fmData[key] || ''
    })

    posts.push(fuseListItem)
  }

  return posts
}

/**
 * fuse main logic
 */
export async function execFuse(options: ResolvedValaxyOptions) {
  consola.info('Start generate fuse list...')
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
  catch { }
}

/**
 * valaxy fuse (will auto generate before build)
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
      await execFuse(options)
    },
  )
}

export const fuseModule = defineValaxyModule({
  extendCli(cli) {
    registerFuseCommand(cli)
  },

  setup(node) {
    node.hook('build:before', async () => {
      await execFuse(node.options)
    })
  },
})
