import type { Awaitable } from '@antfu/utils'
import type { App } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'
import type { MermaidOptions } from './types'

/**
 * @en
 * SSG context interface — property-compatible with ViteSSGContext so that
 * downstream themes / addons only need to change their import path.
 *
 * @zh
 * SSG 上下文接口 — 属性签名与 ViteSSGContext 完全兼容，下游主题/插件只需更改 import 路径。
 */
export interface ValaxySSGContext {
  app: App
  router: Router
  routes: RouteRecordRaw[]
  head: any
  isClient: boolean
  initialState: Record<string, any>
  onSSRAppRendered: (cb: () => void) => void
  triggerOnSSRAppRendered: () => Promise<unknown[]>
  routePath?: string
}

/**
 * @see https://github.com/antfu-collective/vite-ssg
 * @en
 * The context object for the application setup function.
 *
 * @zh
 * 应用 setup 函数的上下文对象。
 */
export type AppContext = ValaxySSGContext

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
