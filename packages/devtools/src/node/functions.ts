import type { ViteDevServer } from 'vite'
import type { ServerFunctions } from '../rpc'
import type { ValaxyDevtoolsOptions } from './types'
import process from 'node:process'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'

export function getFunctions(server: ViteDevServer, devtoolsOptions: ValaxyDevtoolsOptions): ServerFunctions {
  const userRoot = devtoolsOptions.valaxyApp?.options.userRoot || process.cwd()
  // const userRoot = GLOBAL_STATE.valaxyApp?.options.userRoot || process.cwd()
  // const userRoot = process.cwd()
  // const userRoot = server.config.root

  return {
    async getPostList() {
      const files = await fg(`${userRoot}/pages/posts/**/*.md`)

      const posts = []
      for await (const i of files) {
        const md = await fs.readFile(i, 'utf-8')
        const { data } = matter(md)
        posts.push(data)
      }

      return {
        posts,
        root: userRoot,
      }
    },
  }
}
