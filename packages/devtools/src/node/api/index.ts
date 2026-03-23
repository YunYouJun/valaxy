/* eslint-disable unused-imports/no-unused-vars */
import type { Connect, ResolvedConfig, ViteDevServer } from 'vite'
import type { ValaxyDevtoolsOptions } from '../types'
import bodyParser from 'body-parser'

import fs from 'fs-extra'
import matter from 'gray-matter'
import { getFunctions } from '../functions'
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

function sendJson(res: any, data: unknown) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function sendError(res: any, statusCode: number, error: string) {
  res.statusCode = statusCode
  sendJson(res, { error })
}

function createJsonRoute(
  handler: (req: any, res: any) => Promise<unknown>,
  options: { method?: 'GET' | 'POST' } = {},
): Connect.NextHandleFunction {
  return async (req, res) => {
    if (options.method && req.method !== options.method) {
      sendError(res, 405, 'Method not allowed')
      return
    }

    try {
      const data = await handler(req, res)
      if (!res.writableEnded)
        sendJson(res, data)
    }
    catch (e: any) {
      sendError(res, 500, e?.message || String(e))
    }
  }
}

/**
 * register api in vite.server
 * @param server
 * @param _viteConfig
 * @param options
 */
export function registerApi(server: ViteDevServer, _viteConfig: ResolvedConfig, options: ValaxyDevtoolsOptions = {}) {
  const app = server.middlewares
  app.use(bodyParser.json())

  // Legacy routes (frontmatter, migration)
  apis.forEach(({ route, fn }) => {
    app.use(prefix + route, fn)
  })

  // New REST routes — powered by getFunctions()
  const functions = getFunctions(server, options)

  app.use(`${prefix}/options`, createJsonRoute(() => functions.getOptions(), { method: 'GET' }))
  app.use(`${prefix}/posts`, createJsonRoute(() => functions.getPostList(), { method: 'GET' }))
  app.use(`${prefix}/collections`, createJsonRoute(() => functions.getCollectionList(), { method: 'GET' }))

  app.use(`${prefix}/page`, createJsonRoute(async (req, res) => {
    const url = new URL(req.url || '', 'http://localhost')
    const pagePath = url.searchParams.get('path')
    if (!pagePath) {
      sendError(res, 400, 'Missing "path" query parameter')
      return
    }
    return functions.getPageData(pagePath)
  }, { method: 'GET' }))

  app.use(`${prefix}/batch-frontmatter`, createJsonRoute(async (req) => {
    const body = (req as any).body
    const { filePaths, operations } = body
    return functions.batchUpdateFrontmatter(filePaths, operations)
  }, { method: 'POST' }))

  app.use(`${prefix}/config/update`, createJsonRoute(async (req, res) => {
    const body = (req as any).body
    const { configType, fieldPath, value } = body
    if (!configType || !fieldPath) {
      sendError(res, 400, 'Missing configType or fieldPath')
      return
    }
    return functions.updateConfigField(configType, fieldPath, value)
  }, { method: 'POST' }))

  app.use(`${prefix}/config`, createJsonRoute(() => functions.getConfig(), { method: 'GET' }))
}
