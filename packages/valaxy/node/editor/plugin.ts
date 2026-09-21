import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import type { EditorRoutes } from './routes'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { realpath } from 'node:fs/promises'
import { version } from '../env'

function isLoopback(address = '') {
  return address === '::1' || /^(?:::ffff:)?127(?:\.\d{1,3}){3}$/.test(address)
}

function allowed(request: IncomingMessage) {
  if (!isLoopback(request.socket.remoteAddress) || request.headers.origin !== undefined
    || request.headers['sec-fetch-site'] !== undefined || request.headers['x-valaxy-client'] !== '1') {
    return false
  }
  try {
    const url = new URL(`http://${request.headers.host}`)
    return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      && !url.username && !url.password && url.pathname === '/'
  }
  catch {
    return false
  }
}

function json(response: ServerResponse, status: number, body: unknown) {
  for (const name of response.getHeaderNames()) {
    if (name.startsWith('access-control-'))
      response.removeHeader(name)
  }
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  response.end(JSON.stringify(body))
}

async function body(request: IncomingMessage) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    size += Buffer.byteLength(chunk)
    if (size > 8192)
      throw new Error('invalid-request')
    chunks.push(Buffer.from(chunk))
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/** Public, read-only protocol for native editors on the workspace host. */
export function editorPlugin(options: ResolvedValaxyOptions, routes: EditorRoutes): Plugin {
  return {
    name: 'valaxy:editor',
    apply: 'serve',
    async configureServer(server) {
      const projectId = createHash('sha256').update((await realpath(options.userRoot)).replaceAll('\\', '/')).digest('hex')
      const base = new URL(server.config.base, 'http://localhost').pathname.replace(/\/?$/, '/')
      const prefix = `${base}__valaxy__/`
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0]
        if (path !== `${prefix}capabilities` && path !== `${prefix}routes`)
          return next()
        if (!allowed(request))
          return json(response, 403, { error: 'local-editor-only' })
        if (path === `${prefix}capabilities`) {
          if (request.method !== 'GET')
            return json(response, 405, { error: 'method-not-allowed' })
          const devtools = server.config.plugins.find(plugin => plugin.name === 'valaxy:devtools')
          const openPath: string | undefined = devtools?.api?.getOpenPath?.()
          return json(response, 200, {
            protocolVersion: 1,
            valaxyVersion: version,
            projectId,
            base,
            capabilities: {
              routes: { version: 1, resolve: `${prefix}routes` },
              devtools: options.config.devtools
                ? { status: openPath ? 'available' : 'unavailable', path: openPath, authentication: 'browser' }
                : { status: 'disabled' },
            },
          })
        }
        if (request.method !== 'POST')
          return json(response, 405, { error: 'method-not-allowed' })
        if (request.headers['content-type']?.split(';')[0] !== 'application/json')
          return json(response, 415, { error: 'json-required' })
        void (async () => {
          const data = await body(request)
          if (!data || data.projectId !== projectId)
            return json(response, 409, { error: 'workspace-mismatch' })
          const result = await routes.resolve(options.userRoot, data.file)
          json(response, result.status === 'pending' ? 503 : 200, result)
        })().catch(() => {
          if (!response.headersSent)
            json(response, 400, { error: 'invalid-request' })
        })
      })
    },
  }
}
