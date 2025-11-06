import type { Argv } from 'yargs'
import type { FuseListItem, PostFrontMatter } from '../../types'
import type { ResolvedValaxyOptions } from '../types'
import os from 'node:os'
import path from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fg from 'fast-glob'
import fs from 'fs-extra'

import matter from 'gray-matter'
import { defineValaxyModule } from '.'
import { loadLocalesYml, nodeT } from '../../shared/node/i18n'
import { commonOptions } from '../cli/options'
import { resolveOptions } from '../options'
import { matterOptions } from '../plugins/markdown/transform/matter'
import { setEnvProd } from '../utils/env'

export const isWindows = os.platform() === 'win32'

/**
 * @description Generate Fuse List Data for Search
 * @param options
 */
export async function generateFuseList(options: ResolvedValaxyOptions) {
  consola.start(`Generate List for Fuse Search by (${colors.cyan('fuse.js')}) ...`)
  // generate
  const pattern = path.resolve(options.userRoot, options.config.siteConfig.fuse.pattern || 'pages/**/*.md')
  // adapt for windows path
  const finalPattern = isWindows ? fg.convertPathToPattern(pattern) : pattern
  const files = await fg(finalPattern)
  if (files.length > 0) {
    consola.success(`Found ${colors.dim(files.length.toString())} markdown files for fuse search.`)
  }
  else {
    consola.warn(`No markdown files found for fuse search. Please check your fuse pattern: ${colors.dim(finalPattern)}`)
  }

  // load to locale
  loadLocalesYml(path.resolve(options.userRoot, 'locales'))

  const globalAuthor = nodeT(options.config.siteConfig.author.name, options.config.siteConfig.lang || 'en')
  const posts: FuseListItem[] = []
  for await (const i of files) {
    const raw = fs.readFileSync(i, 'utf-8')
    const { data, excerpt, content } = matter(raw, matterOptions)
    const fmData = data as PostFrontMatter

    if (fmData.draft) {
      consola.warn(`Ignore draft post: ${colors.dim(i)}`)
      continue
    }

    if (fmData.hide)
      continue

    // skip encrypt post
    if (fmData.password)
      continue

    const extendKeys = options.config.fuse?.extendKeys || []

    // adapt for nested folders, like /posts/2021/01/01/index.md
    const relativeLink = path.join(options.config.vite?.base || '/', path.relative(path.resolve(options.userRoot, 'pages'), i)).replace(/\\/g, '/')
    const link = i.endsWith('index.md')
      ? relativeLink.replace(/\/index\.md$/, '')
      : relativeLink.replace(/\.md$/, '')

    const fuseListItem: FuseListItem = {
      title: fmData.title || '',
      tags: (typeof fmData.tags === 'string' ? [fmData.tags] : fmData.tags) || [],
      categories: (typeof fmData.categories === 'string' ? [fmData.categories] : fmData.categories) || [],
      author: fmData.author || globalAuthor,
      excerpt: excerpt || content.slice(0, 100),
      // encode for chinese url, replace for windows path
      link: encodeURI(link),
    }

    /**
     * 全文搜索
     */
    if (options.config.siteConfig.fuse.options.keys?.includes('content')) {
      fuseListItem.content = content
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
  consola.success(`Generate fuse list in ${colors.dim(publicFolder)}`)

  // copy to dist
  const distFolder = path.resolve(options.userRoot, 'dist')
  const distFuseFile = path.resolve(distFolder, options.config.siteConfig.fuse.dataPath)
  await fs.ensureDir(distFolder)
  fs.writeJSONSync(distFuseFile, fuseList)
  consola.success(`Generate fuse list in ${colors.dim(distFolder)}`)

  try {
    const gitignorePath = path.resolve(options.userRoot, '.gitignore')
    const gitignore = await fs.readFile(gitignorePath, 'utf-8')
    const ignorePath = publicRelativeFile.replace(/\\/g, '/')
    if (!gitignore.includes(ignorePath)) {
      await fs.appendFile(gitignorePath, `\n# valaxy fuse\n${ignorePath}\n`)
      consola.success(`Add ${colors.dim(ignorePath)} to ${colors.dim('.gitignore')}`)
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
