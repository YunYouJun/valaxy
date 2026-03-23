import type { Connect, ResolvedConfig, ViteDevServer } from 'vite'
import type { ValaxyDevtoolsOptions } from '../types'
import bodyParser from 'body-parser'
import { getFunctions } from '../functions'

const prefix = '/valaxy-devtools-api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type RouteHandler = (req: Connect.IncomingMessage, res: any) => Promise<unknown>

function isExactRouteRequest(req: Connect.IncomingMessage) {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname
  return pathname === '/' || pathname === ''
}

function sendJson(res: any, data: unknown) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function sendError(res: any, statusCode: number, error: string) {
  res.statusCode = statusCode
  sendJson(res, { error })
}

/**
 * Create a Connect middleware that dispatches by HTTP method.
 *
 * @example
 * ```ts
 * app.use('/posts', createRoute({
 *   GET: () => getPostList(),
 *   POST: req => createPost(req.body),
 * }))
 * ```
 */
function createRoute(handlers: Partial<Record<HttpMethod, RouteHandler>>): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!isExactRouteRequest(req)) {
      next?.()
      return
    }

    const method = req.method?.toUpperCase() as HttpMethod
    const handler = handlers[method]

    if (!handler) {
      next?.()
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
 * Register RESTful API routes on the Vite dev server.
 *
 * All routes are prefixed with {@link prefix} (`/valaxy-devtools-api`).
 *
 * | Method | Route                | Description              |
 * |--------|----------------------|--------------------------|
 * | GET    | /options             | Dev server options       |
 * | GET    | /posts               | List posts               |
 * | POST   | /posts               | Create a new post        |
 * | GET    | /pages?path=...      | Single page data         |
 * | GET    | /collections         | List collections         |
 * | POST   | /frontmatter         | Update single frontmatter|
 * | POST   | /frontmatter/batch   | Batch update frontmatter |
 * | POST   | /migration           | Run migration            |
 * | GET    | /config              | Read config              |
 * | PUT    | /config              | Update config field      |
 */
export function registerApi(server: ViteDevServer, _viteConfig: ResolvedConfig, options: ValaxyDevtoolsOptions = {}) {
  const app = server.middlewares
  app.use(bodyParser.json())

  const functions = getFunctions(server, options)

  // GET /options
  app.use(`${prefix}/options`, createRoute({
    GET: () => functions.getOptions(),
  }))

  // GET|POST /posts
  app.use(`${prefix}/posts`, createRoute({
    GET: () => functions.getPostList(),
    POST: async (req, res) => {
      const body = (req as any).body
      if (!body?.title) {
        sendError(res, 400, 'Missing title')
        return
      }
      return functions.createPost(body)
    },
  }))

  // GET /pages?path=...
  app.use(`${prefix}/pages`, createRoute({
    GET: async (req, res) => {
      const url = new URL(req.url || '', 'http://localhost')
      const pagePath = url.searchParams.get('path')
      if (!pagePath) {
        sendError(res, 400, 'Missing "path" query parameter')
        return
      }
      return functions.getPageData(pagePath)
    },
  }))

  // GET /collections
  app.use(`${prefix}/collections`, createRoute({
    GET: () => functions.getCollectionList(),
  }))

  // POST /frontmatter — update single page frontmatter
  // POST /frontmatter/batch — batch update frontmatter
  app.use(`${prefix}/frontmatter/batch`, createRoute({
    POST: async (req, res) => {
      const body = (req as any).body
      const { filePaths, operations } = body
      if (!Array.isArray(filePaths) || !Array.isArray(operations)) {
        sendError(res, 400, 'Invalid request: filePaths and operations must be arrays')
        return
      }
      for (const op of operations) {
        if (!op || typeof op.type !== 'string' || typeof op.key !== 'string') {
          sendError(res, 400, 'Invalid operation: each operation must have type and key')
          return
        }
      }
      return functions.batchUpdateFrontmatter(filePaths, operations)
    },
  }))

  app.use(`${prefix}/frontmatter`, createRoute({
    POST: async (req) => {
      return functions.updateFrontmatter((req as any).body)
    },
  }))

  // POST /migration
  app.use(`${prefix}/migration`, createRoute({
    POST: async (req) => {
      const { filePaths, frontmatter } = (req as any).body
      return functions.runMigration(filePaths, frontmatter)
    },
  }))

  // GET|PUT /config
  app.use(`${prefix}/config`, createRoute({
    GET: () => functions.getConfig(),
    PUT: async (req, res) => {
      const body = (req as any).body
      const { configType, fieldPath, value } = body
      if (!configType || !fieldPath) {
        sendError(res, 400, 'Missing configType or fieldPath')
        return
      }
      return functions.updateConfigField(configType, fieldPath, value)
    },
  }))
}
