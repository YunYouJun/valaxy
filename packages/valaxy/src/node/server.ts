import type { ServerOptions } from 'vite'
import { createServer as createViteServer } from 'vite'
// import { resolveConfig } from './config'

export async function createServer(
  root: string = process.cwd(),
  serverOptions: ServerOptions = {},
) {
  // const config = await resolveConfig()

  return createViteServer({
    root,
    // todo
    // base: config.site.base,
    server: serverOptions,
  })
}
