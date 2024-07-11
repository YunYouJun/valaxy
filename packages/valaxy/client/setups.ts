import type { ViteSSGContext } from 'vite-ssg'
import type { Awaitable } from '@antfu/utils'
import type { MermaidOptions } from './types'

/**
 * @see https://github.com/antfu-collective/vite-ssg
 * @en
 * The context object for the application setup function.
 *
 * @zh
 * 应用 setup 函数的上下文对象。（包括了 ViteSSG context）
 */
export type AppContext = ViteSSGContext

export type AppSetup = (ctx: AppContext) => Awaitable<void>

// client
export type MermaidSetup = () => Partial<MermaidOptions> | void

/**
 * @en
 * Define the setup function for the client application.
 *
 * @zh
 * 扩展客户端应用的 setup 函数。
 */
export function defineAppSetup(fn: AppSetup) {
  return fn
}

export function defineMermaidSetup(fn: MermaidSetup) {
  return fn
}
