/* eslint-disable unused-imports/no-unused-vars */
import type { Connect, ResolvedConfig, ViteDevServer } from 'vite'
import bodyParser from 'body-parser'

import fs from 'fs-extra'
import matter from 'gray-matter'
import { migration } from '../utils/migration'

const prefix = '/valaxy-devtools-api'

const apis: {
  route: string
  fn: Connect.NextHandleFunction
}[] = [
  {
    route: '/frontmatter',
    fn: async (req, res) => {
      // update
      if (req.method === 'POST') {
        const { pageData, frontmatter: newFm } = await (req as any).body
        // filePath
        const path = pageData.path
        if (fs.existsSync(path)) {
          const rawMd = await fs.readFile(path, 'utf-8')
          const matterFile = matter(rawMd)

          // update frontmatter
          matterFile.data = newFm
          const newMd = matter.stringify(matterFile.content, matterFile.data)
          await fs.writeFile(path, newMd)
        }
      }
    },
  },

  {
    route: '/migration',
    fn: async (req, res) => {
      // update
      if (req.method === 'POST') {
        const { pageData, frontmatter } = await (req as any).body
        // filePath
        const worker: Promise<void>[] = []

        for (const item of pageData) {
          const path = item
          worker.push(migration(path, frontmatter))
        }
        //   worker.push(migration(`${userRoot.root}/pages${item}.md`, frontmatter))
        // for (const item of pageData)
        //   worker.push(migration(item, frontmatter))

        Promise.all(worker).then(() => {
          res.end('ok')
        }).catch((_) => {
          res.end('migration error')
        })
      }
    },
  },
]

/**
 * register api in vite.server
 * @param server
 * @param _viteConfig
 */
export function registerApi(server: ViteDevServer, _viteConfig: ResolvedConfig) {
  const app = server.middlewares
  app.use(bodyParser.json())

  apis.forEach(({ route, fn }) => {
    app.use(prefix + route, fn)
  })
}
