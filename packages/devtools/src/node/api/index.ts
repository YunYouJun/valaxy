import type { ResolvedConfig, ViteDevServer } from 'vite'
import bodyParser from 'body-parser'

import matter from 'gray-matter'
import { JSON_SCHEMA } from 'js-yaml'
import fs from 'fs-extra'

const prefix = '/valaxy-devtools-api'
export const userroot: { root: string } = { root: '' }

async function migration(path: string, frontmatter: { [key: string]: string }) {
  if (fs.existsSync(path)) {
    const rawMd = await fs.readFile(path, 'utf-8')
    const matterFile = matter(rawMd, { schema: JSON_SCHEMA } as any)
    let mod = false
    for (const key in frontmatter) {
      if (key in matterFile.data) {
        matterFile.data[frontmatter[key]] = matterFile.data[key]
        delete matterFile.data[key]
        mod = true
      }
    }
    if (mod) {
      const newMd = matter.stringify(matterFile.content, matterFile.data)
      await fs.writeFile(path, newMd)
    }
  }
  else {
    // console.error(`post not exist:${path}`)
  }
}

export function registerApi(server: ViteDevServer, _viteConfig: ResolvedConfig) {
  const app = server.middlewares

  app.use(bodyParser.json())

  app.use(`${prefix}/frontmatter`, async (req, _res) => {
    // update
    if (req.method === 'POST') {
      const { pageData, frontmatter: newFm } = await (req as any).body
      // filePath
      const path = `${userroot.root}/pages${pageData.path}.md`
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

  app.use(`${prefix}/migration`, async (req, _res) => {
    // update
    if (req.method === 'POST') {
      const { pageData, frontmatter } = await (req as any).body
      // filePath
      const worker: Promise<void>[] = []

      for (const item of pageData)
        worker.push(migration(`${userroot.root}/pages${item}.md`, frontmatter))

      Promise.all(worker).then(() => {
        _res.end('ok')
      }).catch((_) => {
        _res.end('migration error')
      })
    }
  })
}
