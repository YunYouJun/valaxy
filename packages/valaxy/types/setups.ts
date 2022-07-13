import type { VitePluginConfig as UnoCssConfig } from 'unocss/vite'
import type { Awaitable } from '@antfu/utils'

export type UnoSetup = () => Awaitable<Partial<UnoCssConfig> | undefined>

export function defineUnoSetup(fn: UnoSetup) {
  return fn
}
