import type { DevframeNodeContext } from 'devframe'
import type { ViteDevServer } from 'vite'
import type { ResourceState } from '../shared/state'
import type { ValaxyDevtoolsOptions } from './types'
import process from 'node:process'
import pathe from 'pathe'
import { RESOURCES_STATE } from '../shared/state'

/** Coalesce file changes into an invalidation; never broadcast file contents. */
export async function watchResources(server: ViteDevServer, ctx: DevframeNodeContext, options: ValaxyDevtoolsOptions) {
  const state = await ctx.rpc.sharedState.get<ResourceState>(RESOURCES_STATE)
  const root = pathe.resolve(options.userRoot || process.cwd())
  let timer: ReturnType<typeof setTimeout> | undefined
  const changed = (_event: string, file: string) => {
    const relative = pathe.relative(root, file)
    if (!relative.startsWith('pages/') && !['site.config.ts', 'valaxy.config.ts', 'valaxy.config.mts', 'valaxy.config.js', 'valaxy.config.mjs', 'package.json', 'pnpm-lock.yaml'].includes(relative))
      return
    clearTimeout(timer)
    timer = setTimeout(() => state.mutate((value) => {
      value.revision++
    }), 100)
  }
  server.watcher.add(['pages', 'site.config.ts', 'valaxy.config.ts', 'valaxy.config.mts', 'valaxy.config.js', 'valaxy.config.mjs', 'package.json', 'pnpm-lock.yaml'].map(file => pathe.join(root, file)))
  server.watcher.on('all', changed)
  return () => {
    clearTimeout(timer)
    server.watcher.off('all', changed)
  }
}
