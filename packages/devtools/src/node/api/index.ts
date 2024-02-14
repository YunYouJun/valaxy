import type { ResolvedConfig, ViteDevServer } from 'vite'
import bodyParser from 'body-parser'

import matter from 'gray-matter'
import fs from 'fs-extra'

const prefix = '/valaxy-devtools-api'

export function registerApi(server: ViteDevServer, _viteConfig: ResolvedConfig) {
  const app = server.middlewares

  app.use(bodyParser.json())

  app.use(`${prefix}/frontmatter`, async (req, _res) => {
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

    // console.log('update', url, frontmatter)

    // console.log('frontmatter', req.url, res)
  })
}
