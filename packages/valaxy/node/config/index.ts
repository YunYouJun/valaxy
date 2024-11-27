import type { Awaitable } from '@antfu/utils'
import type { VitePluginConfig as UnoCssConfig } from 'unocss/vite'

export * from './addon'

export * from './site'
export * from './theme'
// export * from './merge'
export * from './utils'
export * from './valaxy'

// other configs
// unocss
export type UnoSetup = () => Awaitable<Partial<UnoCssConfig> | undefined>
export function defineUnoSetup(fn: UnoSetup) {
  return fn
}
