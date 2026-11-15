import type { Argv } from 'yargs'
import type { FuseListItem, PostFrontMatter } from '../../types'
import type { ResolvedValaxyOptions } from '../types'
import os from 'node:os'
import path from 'node:path'
import matter from '@11ty/gray-matter'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'fs-extra'

import { glob } from 'tinyglobby'
import { defineValaxyModule } from '.'
import { SENSITIVE_FRONTMATTER_KEYS } from '../../shared/constants'
import { loadLocalesYml, nodeT } from '../../shared/node/i18n'
import { isUnpublishedPage, relativePagePath } from '../../shared/page-policy'
import { stripEncryptedContent } from '../../shared/seo'
import { commonOptions } from '../cli/options'
import { EXCERPT_SEPARATOR } from '../constants'
import { resolveOptions } from '../options'
import { matterOptions } from '../plugins/markdown/transform/matter'
import { setEnvProd } from '../utils/env'
import { discoverPageFiles, getPagePath } from '../utils/pageSources'

export const isWindows = os.platform() === 'win32'

/**
 * @description Generate Fuse List Data for Search
 * @param options
 */
export async function generateFuseList(options: ResolvedValaxyOptions) {
  consola.start(`Generate List for Fuse Search by (${colors.cyan('fuse.js')}) ...`)
  // generate
  const pattern = options.config.siteConfig.fuse.pattern || 'pages/**/*.md'
  const files = await glob(pattern.replace(/\\/g, '/'), { cwd: options.userRoot, absolute: true })
  const fusePattern = options.config.siteConfig.fuse.pattern || 'pages/**/*.md'
  if (fusePattern.startsWith('pages/')) {
    for (const file of (await discoverPageFiles(options.userRoot, [fusePattern.slice(6)])).values()) {
      if (!files.includes(file))
        files.push(file)
    }
  }
  if (files.length > 0) {
    consola.success(`Found ${colors.dim(files.length.toString())} markdown files for fuse search.`)
  }
  else {
    consola.warn(`No markdown files found for fuse search. Please check your fuse pattern: ${colors.dim(pattern)}`)
  }

  // load to locale
  loadLocalesYml(path.resolve(options.userRoot, 'locales'))

  const globalAuthor = nodeT(options.config.siteConfig.author.name, options.config.siteConfig.lang || 'en')
  const posts: FuseListItem[] = []
  for (const i of files) {
    const raw = await fs.readFile(i, 'utf-8')
    const { data, content: rawContent } = matter(raw, matterOptions)
    const fmData = { ...options.config.siteConfig.frontmatter, ...data } as PostFrontMatter
    // Strip complete private blocks before looking for the excerpt separator, which
    // may itself occur inside an encrypted block.
    const content = stripEncryptedContent(rawContent)
    const separator = content.indexOf(EXCERPT_SEPARATOR)
    const excerpt = separator < 0 ? '' : content.slice(0, separator)

    const relative = relativePagePath(i, options.userRoot)
    if (relative && isUnpublishedPage(relative, options.config.siteConfig.publishing))
      continue

    if (fmData.draft && !options.config.siteConfig.publishing?.drafts) {
      consola.warn(`Ignore draft post: ${colors.dim(i)}`)
      continue
    }

    if (fmData.hide)
      continue

    // skip encrypt post
    if (fmData.password || fmData.encrypt === true)
      continue

    const extendKeys = options.config.fuse?.extendKeys || []

    // adapt for nested folders, like /posts/2021/01/01/index.md
    const relativeLink = path.join(options.config.vite?.base || '/', getPagePath(i, options.userRoot) || path.relative(path.resolve(options.userRoot, 'pages'), i)).replace(/\\/g, '/')
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
      if (SENSITIVE_FRONTMATTER_KEYS.has(key) || (key === 'photos' && 'gallery_password' in fmData))
        return
      const value = fmData[key] || ''
      fuseListItem[key] = typeof value === 'string' ? stripEncryptedContent(value) : value
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
