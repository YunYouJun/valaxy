import type { ViteSSGContext } from 'vite-ssg'
import type { Awaitable } from '@antfu/utils'
import type { MermaidOptions } from './types'

export type AppContext = ViteSSGContext

export type AppSetup = (ctx: AppContext) => Awaitable<void>

// client
export type MermaidSetup = () => Partial<MermaidOptions> | void

export function defineAppSetup(fn: AppSetup) {
  return fn
}

export function defineMermaidSetup(fn: MermaidSetup) {
  return fn
}
