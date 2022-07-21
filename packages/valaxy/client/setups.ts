import type { ViteSSGContext } from 'vite-ssg'
import type { Awaitable } from '@antfu/utils'

export type AppContext = ViteSSGContext

export type AppSetup = (ctx: AppContext) => Awaitable<void>

export function defineAppSetup(fn: AppSetup) {
  return fn
}
