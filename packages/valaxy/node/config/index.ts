import type { VitePluginConfig as UnoCssConfig } from 'unocss/vite'
import type { Awaitable } from '@antfu/utils'

// export * from './merge'
export * from './utils'

export * from './valaxy'
export * from './addon'
export * from './site'
export * from './theme'

// other configs
// unocss
export type UnoSetup = () => Awaitable<Partial<UnoCssConfig> | undefined>
export function defineUnoSetup(fn: UnoSetup) {
  return fn
}
