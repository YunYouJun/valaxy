import type { ViteSSGContext } from 'vite-ssg'
import type { Awaitable } from '@antfu/utils'
import type { VitePluginConfig as UnoCssConfig } from 'unocss/vite'

type AppContext = ViteSSGContext

export type AppSetup = (ctx: AppContext) => Awaitable<void>
export type UnoSetup = () => Awaitable<Partial<UnoCssConfig> | undefined>

export function defineAppSetup(fn: AppSetup) {
  return fn
}

export function defineUnoSetup(fn: UnoSetup) {
  return fn
}
