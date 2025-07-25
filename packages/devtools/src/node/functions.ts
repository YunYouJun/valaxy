import type { ViteDevServer } from 'vite'
import type { ServerFunctions } from '../../rpc'
import type { ValaxyDevtoolsOptions } from './types'
import process from 'node:process'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import pathe from 'pathe'

function ensurePrefix(prefix: string, str: string) {
  if (!str.startsWith(prefix))
    return prefix + str
}

export function getFunctions(server: ViteDevServer, devtoolsOptions: ValaxyDevtoolsOptions): ServerFunctions {
  const userRoot = (devtoolsOptions.userRoot || process.cwd()).replace(/\\/g, '/')
  // const userRoot = GLOBAL_STATE.valaxyApp?.options.userRoot || process.cwd()
  // const userRoot = process.cwd()
  // const userRoot = server.config.root

  function getRoutePath(filePath: string) {
    const relativePath = pathe.relative(pathe.resolve(userRoot, 'pages'), filePath).slice(0, -'.md'.length)
    return ensurePrefix('/', relativePath)
  }

  return {
    async getOptions() {
      return {
        userRoot,
      }
    },

    async getPostList() {
      const files = await fg(`${userRoot}/pages/posts/**/*.md`)

      const posts = []
      for await (const file of files) {
        const md = await fs.readFile(file, 'utf-8')
        const { data } = matter(md)
        posts.push({
          routePath: getRoutePath(file),
          frontmatter: data,
          filePath: file,
        })
      }

      return {
        // sort by updated
        posts: posts.sort((a, b) => {
          const bDateValue = dayjs(b.frontmatter.date).valueOf()
          const aDateValue = dayjs(a.frontmatter.date).valueOf()
          return bDateValue - aDateValue
        }),
        root: userRoot,
      }
    },

    async getPageData(pagePath: string) {
      const relativePath = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath
      const file = pathe.resolve(userRoot, relativePath)
      const { data } = matter(file)

      return {
        routePath: getRoutePath(file),
        filePath: file,
        frontmatter: data,
      }
    },
  }
}
